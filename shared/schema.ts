import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["admin", "member"] }).default("member").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === INQUIRIES (Personal) ===
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  question: text("question").notNull(),
  pathway: text("pathway").notNull(), // Books, courses, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// === REFLECTIONS (Weekly) ===
export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => inquiries.id).notNull(),
  weekOf: timestamp("week_of").notNull(),
  content: text("content").notNull(),
  visibility: text("visibility").notNull().default("private"), // "private", "group", "cohort"
  createdAt: timestamp("created_at").defaultNow(),
});

// === SHARED RESOURCES ===
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  tags: text("tags").array(),
  annotation: text("annotation"),
  visibility: text("visibility").notNull().default("cohort"), // "private", "group", "cohort"
  createdAt: timestamp("created_at").defaultNow(),
});

// === MEETINGS ===
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  title: text("title").notNull(),
  agenda: text("agenda"),
  notes: text("notes"),
  actionItems: text("action_items"),
  zoomLink: text("zoom_link"), // Optional override for specific meeting
  createdAt: timestamp("created_at").defaultNow(),
});

// === REPORT BUILDER ===
export const reportSections = pgTable("report_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"), // Prompts or instructions
  orderIndex: integer("order_index").notNull(),
  slug: text("slug").notNull(), // e.g. "introduction", "methods"
});

// === INQUIRY COMMENTS (Admin Feedback) ===
export const inquiryComments = pgTable("inquiry_comments", {
  id: serial("id").primaryKey(),
  inquiryId: integer("inquiry_id").references(() => inquiries.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportVersions = pgTable("report_versions", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => reportSections.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  justiceLensTags: text("justice_lens_tags").array(), // "who_benefits", "labor", etc.
  visibility: text("visibility").notNull().default("cohort"), // "private", "group", "cohort"
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => reportSections.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SETTINGS (Admin) ===
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(), // 'cohort_name', 'magic_code', 'meeting_link'
  value: text("value").notNull(),
});

// === JUSTICE LENSES ===
export const justiceLenses = pgTable("justice_lenses", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // "who_benefits", "labor", etc.
  label: text("label").notNull(), // "Who benefits?", "Invisible Labor", etc.
  orderIndex: integer("order_index").notNull().default(0),
  indices: text("indices").array(), // Array of index items for this lens
});

// === INQUIRY MAPPINGS (AI Inquiry Templates) ===
export const inquiryMappings = pgTable("inquiry_mappings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Human-Wildlife Conflict Inquiry"
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SECTION-LENS MAPPINGS (Which lenses/indices apply to each section) ===
export const sectionLensMappings = pgTable("section_lens_mappings", {
  id: serial("id").primaryKey(),
  mappingId: integer("mapping_id").references(() => inquiryMappings.id).notNull(),
  sectionSlug: text("section_slug").notNull(), // "introduction", "methods", etc.
  lensSlug: text("lens_slug").notNull(), // "resources", "conflict", etc.
  indices: text("indices").array(), // ["land", "water", "energy"] - specific indices to use
});

// === POST READS (Track who viewed a report version) ===
export const postReads = pgTable("post_reads", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => reportVersions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow(),
});

// === POST REACTIONS (Emoji reactions on report versions) ===
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  versionId: integer("version_id").references(() => reportVersions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reactionType: text("reaction_type").notNull(), // "insightful", "well_written", "thoughtful", "love"
  createdAt: timestamp("created_at").defaultNow(),
});

// === AI CONTENT CHUNKS (For retrieval-based summarization) ===
export const aiContentChunks = pgTable("ai_content_chunks", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(), // "reflection", "report_post", "comment", "resource", "inquiry"
  sourceId: integer("source_id").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sectionId: integer("section_id").references(() => reportSections.id), // nullable
  chunkIndex: integer("chunk_index").notNull().default(0),
  chunkText: text("chunk_text").notNull(),
  startOffset: integer("start_offset"),
  endOffset: integer("end_offset"),
  contentHash: text("content_hash").notNull(),
  metadata: jsonb("metadata"), // { tags, justiceLenses, date }
  visibility: text("visibility").notNull().default("cohort"), // "private", "group", "cohort"
  excludeFromAI: boolean("exclude_from_ai").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AI SUMMARIES (Stored generated summaries) ===
export const aiSummaries = pgTable("ai_summaries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "my_journey", "section_draft", "weekly_digest"
  scope: text("scope").notNull(), // "personal", "group", "cohort"
  userId: integer("user_id").references(() => users.id), // For personal summaries
  sectionId: integer("section_id").references(() => reportSections.id), // For section summaries
  timeRangeStart: timestamp("time_range_start"),
  timeRangeEnd: timestamp("time_range_end"),
  content: jsonb("content").notNull(), // Structured output JSON
  evidenceChunkIds: integer("evidence_chunk_ids").array(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// === USER AI SETTINGS ===
export const userAiSettings = pgTable("user_ai_settings", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  includePrivateInAI: boolean("include_private_in_ai").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === CONVERSATIONS (For chat integration) ===
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === MESSAGES (Chat messages) ===
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(), // "user", "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  user: one(users, { fields: [inquiries.userId], references: [users.id] }),
  reflections: many(reflections),
}));

export const reflectionsRelations = relations(reflections, ({ one }) => ({
  inquiry: one(inquiries, { fields: [reflections.inquiryId], references: [inquiries.id] }),
}));

export const inquiryCommentsRelations = relations(inquiryComments, ({ one }) => ({
  inquiry: one(inquiries, { fields: [inquiryComments.inquiryId], references: [inquiries.id] }),
  user: one(users, { fields: [inquiryComments.userId], references: [users.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  user: one(users, { fields: [resources.userId], references: [users.id] }),
}));

export const reportVersionsRelations = relations(reportVersions, ({ one }) => ({
  section: one(reportSections, { fields: [reportVersions.sectionId], references: [reportSections.id] }),
  author: one(users, { fields: [reportVersions.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  section: one(reportSections, { fields: [comments.sectionId], references: [reportSections.id] }),
  author: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const postReadsRelations = relations(postReads, ({ one }) => ({
  version: one(reportVersions, { fields: [postReads.versionId], references: [reportVersions.id] }),
  user: one(users, { fields: [postReads.userId], references: [users.id] }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  version: one(reportVersions, { fields: [postReactions.versionId], references: [reportVersions.id] }),
  user: one(users, { fields: [postReactions.userId], references: [users.id] }),
}));

// === INSERTS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });
export const insertReflectionSchema = createInsertSchema(reflections).omit({ id: true, createdAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true, createdAt: true });
export const insertReportSectionSchema = createInsertSchema(reportSections).omit({ id: true });
export const insertReportVersionSchema = createInsertSchema(reportVersions).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertInquiryCommentSchema = createInsertSchema(inquiryComments).omit({ id: true, createdAt: true });
export const insertSettingSchema = createInsertSchema(appSettings);
export const insertJusticeLensSchema = createInsertSchema(justiceLenses).omit({ id: true });
export const insertInquiryMappingSchema = createInsertSchema(inquiryMappings).omit({ id: true, createdAt: true });
export const insertSectionLensMappingSchema = createInsertSchema(sectionLensMappings).omit({ id: true });
export const insertPostReadSchema = createInsertSchema(postReads).omit({ id: true, readAt: true });
export const insertPostReactionSchema = createInsertSchema(postReactions).omit({ id: true, createdAt: true });
export const insertAiContentChunkSchema = createInsertSchema(aiContentChunks).omit({ id: true, createdAt: true });
export const insertAiSummarySchema = createInsertSchema(aiSummaries).omit({ id: true, generatedAt: true });
export const insertUserAiSettingsSchema = createInsertSchema(userAiSettings).omit({ updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === EXPORTS ===
export type User = typeof users.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Reflection = typeof reflections.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type ReportSection = typeof reportSections.$inferSelect;
export type ReportVersion = typeof reportVersions.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InquiryComment = typeof inquiryComments.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type JusticeLens = typeof justiceLenses.$inferSelect;
export type InquiryMapping = typeof inquiryMappings.$inferSelect;
export type SectionLensMapping = typeof sectionLensMappings.$inferSelect;
export type PostRead = typeof postReads.$inferSelect;
export type PostReaction = typeof postReactions.$inferSelect;
export type AiContentChunk = typeof aiContentChunks.$inferSelect;
export type AiSummary = typeof aiSummaries.$inferSelect;
export type UserAiSettings = typeof userAiSettings.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type ChatMessage = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertReportSection = z.infer<typeof insertReportSectionSchema>;
export type InsertReportVersion = z.infer<typeof insertReportVersionSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertInquiryComment = z.infer<typeof insertInquiryCommentSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type InsertJusticeLens = z.infer<typeof insertJusticeLensSchema>;
export type InsertInquiryMapping = z.infer<typeof insertInquiryMappingSchema>;
export type InsertSectionLensMapping = z.infer<typeof insertSectionLensMappingSchema>;
export type InsertPostRead = z.infer<typeof insertPostReadSchema>;
export type InsertPostReaction = z.infer<typeof insertPostReactionSchema>;
export type InsertAiContentChunk = z.infer<typeof insertAiContentChunkSchema>;
export type InsertAiSummary = z.infer<typeof insertAiSummarySchema>;
export type InsertUserAiSettings = z.infer<typeof insertUserAiSettingsSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
