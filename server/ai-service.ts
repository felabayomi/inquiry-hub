import OpenAI from "openai";
import crypto from "crypto";
import { db } from "./db";
import { 
  aiContentChunks, 
  aiSummaries, 
  userAiSettings,
  reflections,
  reportVersions,
  comments,
  resources,
  inquiries,
  users
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface EvidenceItem {
  chunkId: number;
  sourceType: string;
  sourceId: number;
  excerpt: string;
  authorName?: string;
  sectionId?: number;
}

export interface AiSummaryOutput {
  highLevelSummary: string;
  keyThemes: string[];
  notableQuotes: { text: string; chunkId: number; sourceType?: string; sourceId?: number }[];
  openQuestions: string[];
  recommendedNextSteps: string[];
  evidence: EvidenceItem[];
}

function computeHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

function chunkByParagraphs(text: string, maxChunkLength = 800): { text: string; startOffset: number; endOffset: number }[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: { text: string; startOffset: number; endOffset: number }[] = [];
  let currentChunk = "";
  let currentStart = 0;
  let offset = 0;

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkLength && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startOffset: currentStart,
        endOffset: offset - 1,
      });
      currentChunk = para;
      currentStart = offset;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
    offset += para.length + 2;
  }

  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      startOffset: currentStart,
      endOffset: offset,
    });
  }

  return chunks;
}

export async function indexContent(
  sourceType: "reflection" | "report_post" | "comment" | "resource" | "inquiry",
  sourceId: number,
  userId: number,
  content: string,
  sectionId?: number,
  metadata?: Record<string, unknown>,
  visibility: "private" | "group" | "cohort" = "cohort"
) {
  const contentHash = computeHash(content);
  
  const existing = await db.select()
    .from(aiContentChunks)
    .where(and(
      eq(aiContentChunks.sourceType, sourceType),
      eq(aiContentChunks.sourceId, sourceId)
    ))
    .limit(1);

  if (existing.length > 0 && existing[0].contentHash === contentHash) {
    return;
  }

  if (existing.length > 0) {
    await db.delete(aiContentChunks)
      .where(and(
        eq(aiContentChunks.sourceType, sourceType),
        eq(aiContentChunks.sourceId, sourceId)
      ));
  }

  const chunks = chunkByParagraphs(content);
  
  for (let i = 0; i < chunks.length; i++) {
    await db.insert(aiContentChunks).values({
      sourceType,
      sourceId,
      userId,
      sectionId,
      chunkIndex: i,
      chunkText: chunks[i].text,
      startOffset: chunks[i].startOffset,
      endOffset: chunks[i].endOffset,
      contentHash,
      metadata: metadata || {},
      visibility,
      excludeFromAI: false,
    });
  }
}

export async function getUserAiSettings(userId: number) {
  const [settings] = await db.select()
    .from(userAiSettings)
    .where(eq(userAiSettings.userId, userId));
  
  return settings || { userId, includePrivateInAI: false };
}

export async function updateUserAiSettings(userId: number, includePrivateInAI: boolean) {
  const existing = await getUserAiSettings(userId);
  
  if (existing.userId === userId) {
    await db.update(userAiSettings)
      .set({ includePrivateInAI, updatedAt: new Date() })
      .where(eq(userAiSettings.userId, userId));
  } else {
    await db.insert(userAiSettings).values({ userId, includePrivateInAI });
  }
}

export async function getChunksForUser(userId: number, limit = 30) {
  const settings = await getUserAiSettings(userId);
  
  let query = db.select({
    chunk: aiContentChunks,
    user: users,
  })
    .from(aiContentChunks)
    .leftJoin(users, eq(aiContentChunks.userId, users.id))
    .where(and(
      eq(aiContentChunks.userId, userId),
      eq(aiContentChunks.excludeFromAI, false),
      settings.includePrivateInAI 
        ? undefined 
        : inArray(aiContentChunks.visibility, ["group", "cohort"])
    ))
    .orderBy(desc(aiContentChunks.createdAt))
    .limit(limit);

  return query;
}

export async function getChunksForSection(sectionId: number, limit = 30) {
  return db.select({
    chunk: aiContentChunks,
    user: users,
  })
    .from(aiContentChunks)
    .leftJoin(users, eq(aiContentChunks.userId, users.id))
    .where(and(
      eq(aiContentChunks.sectionId, sectionId),
      eq(aiContentChunks.excludeFromAI, false),
      eq(aiContentChunks.visibility, "cohort")
    ))
    .orderBy(desc(aiContentChunks.createdAt))
    .limit(limit);
}

export async function generateJourneySummary(userId: number): Promise<AiSummaryOutput> {
  const chunksResult = await getChunksForUser(userId, 25);
  
  if (chunksResult.length === 0) {
    return {
      highLevelSummary: "You haven't added any content yet. Start by adding reflections, resources, or contributing to the report.",
      keyThemes: [],
      notableQuotes: [],
      openQuestions: ["What inquiry questions are you exploring?"],
      recommendedNextSteps: ["Add your first weekly reflection", "Share a resource with the cohort"],
      evidence: [],
    };
  }

  const chunksText = chunksResult.map((r, i) => 
    `[${i + 1}] (${r.chunk.sourceType}) ${r.chunk.chunkText}`
  ).join("\n\n");

  const systemPrompt = `You are an AI assistant helping Ed.D. doctoral students synthesize their inquiry journey. 
Analyze the provided content chunks and generate a structured summary of their learning journey.
Focus on themes, insights, growth, and connections to justice/ethics when present.
Always respond with valid JSON matching the schema exactly.`;

  const userPrompt = `Analyze these content chunks from a doctoral student's inquiry journey and provide a synthesis:

${chunksText}

Respond with a JSON object containing:
{
  "highLevelSummary": "2-3 sentences summarizing the overall journey and growth",
  "keyThemes": ["theme1", "theme2", ...] (3-5 key themes),
  "notableQuotes": [{"text": "quote excerpt", "chunkId": chunk_number}] (2-3 notable quotes with their chunk numbers),
  "openQuestions": ["question1", ...] (2-3 open questions emerging from the work),
  "recommendedNextSteps": ["step1", ...] (2-3 suggested next actions),
  "evidence": [{"chunkId": chunk_number, "sourceType": "type", "excerpt": "brief excerpt"}] (key supporting evidence)
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as AiSummaryOutput;
    
    parsed.evidence = (parsed.evidence || []).map(e => {
      const chunk = chunksResult[e.chunkId - 1];
      return {
        ...e,
        sourceType: chunk?.chunk.sourceType || e.sourceType,
        sourceId: chunk?.chunk.sourceId || 0,
        sectionId: chunk?.chunk.sectionId || undefined,
        authorName: chunk?.user?.fullName || "Unknown",
      };
    });

    parsed.notableQuotes = (parsed.notableQuotes || []).map(q => {
      const chunk = chunksResult[q.chunkId - 1];
      return {
        ...q,
        sourceType: chunk?.chunk.sourceType,
        sourceId: chunk?.chunk.sourceId,
      };
    });

    await db.insert(aiSummaries).values({
      type: "my_journey",
      scope: "personal",
      userId,
      content: parsed,
      evidenceChunkIds: chunksResult.map(r => r.chunk.id),
    });

    return parsed;
  } catch (error) {
    console.error("Error generating journey summary:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}

export async function generateSectionSynthesis(sectionId: number): Promise<AiSummaryOutput> {
  const chunksResult = await getChunksForSection(sectionId, 25);
  
  if (chunksResult.length === 0) {
    return {
      highLevelSummary: "No contributions yet in this section.",
      keyThemes: [],
      notableQuotes: [],
      openQuestions: ["What would you like to contribute to this section?"],
      recommendedNextSteps: ["Be the first to add a contribution"],
      evidence: [],
    };
  }

  const chunksText = chunksResult.map((r, i) => 
    `[${i + 1}] (by ${r.user?.fullName || "Unknown"}) ${r.chunk.chunkText}`
  ).join("\n\n");

  const systemPrompt = `You are an AI assistant helping synthesize collaborative doctoral research.
Analyze the provided contributions from multiple cohort members and generate a synthesis.
Identify common themes, tensions, and connections while respecting each contributor's voice.
Focus on justice and ethics implications when present.
Always respond with valid JSON.`;

  const userPrompt = `Synthesize these contributions from multiple cohort members for a report section:

${chunksText}

Respond with a JSON object containing:
{
  "highLevelSummary": "2-3 sentences synthesizing the collective contributions",
  "keyThemes": ["theme1", "theme2", ...] (3-5 key themes across contributions),
  "notableQuotes": [{"text": "quote excerpt", "chunkId": chunk_number}] (2-3 notable quotes),
  "openQuestions": ["question1", ...] (2-3 open questions for the group to consider),
  "recommendedNextSteps": ["step1", ...] (2-3 suggested ways to develop this section),
  "evidence": [{"chunkId": chunk_number, "sourceType": "type", "excerpt": "brief excerpt"}]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content) as AiSummaryOutput;
    
    parsed.evidence = (parsed.evidence || []).map(e => {
      const chunk = chunksResult[e.chunkId - 1];
      return {
        ...e,
        sourceType: chunk?.chunk.sourceType || e.sourceType,
        sourceId: chunk?.chunk.sourceId || 0,
        sectionId: chunk?.chunk.sectionId || sectionId,
        authorName: chunk?.user?.fullName || "Unknown",
      };
    });

    parsed.notableQuotes = (parsed.notableQuotes || []).map(q => {
      const chunk = chunksResult[q.chunkId - 1];
      return {
        ...q,
        sourceType: chunk?.chunk.sourceType,
        sourceId: chunk?.chunk.sourceId,
      };
    });

    await db.insert(aiSummaries).values({
      type: "section_draft",
      scope: "cohort",
      sectionId,
      content: parsed,
      evidenceChunkIds: chunksResult.map(r => r.chunk.id),
    });

    return parsed;
  } catch (error) {
    console.error("Error generating section synthesis:", error);
    throw new Error("Failed to generate synthesis. Please try again.");
  }
}

export async function getRecentSummaries(userId: number, type?: string) {
  let query = db.select()
    .from(aiSummaries)
    .where(type 
      ? and(eq(aiSummaries.userId, userId), eq(aiSummaries.type, type))
      : eq(aiSummaries.userId, userId)
    )
    .orderBy(desc(aiSummaries.generatedAt))
    .limit(10);

  return query;
}

export async function getSectionSummaries(sectionId: number) {
  return db.select()
    .from(aiSummaries)
    .where(and(
      eq(aiSummaries.sectionId, sectionId),
      eq(aiSummaries.type, "section_draft")
    ))
    .orderBy(desc(aiSummaries.generatedAt))
    .limit(5);
}
