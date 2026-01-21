import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  indexContent,
  generateJourneySummary,
  generateSectionSynthesis,
  getRecentSummaries,
  getSectionSummaries,
  getUserAiSettings,
  updateUserAiSettings,
} from "./ai-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth (Passport)
  setupAuth(app);

  // === INQUIRIES ===
  app.get(api.inquiries.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const inquiry = await storage.getInquiryByUserId(req.user.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    
    const reflections = await storage.getReflections(inquiry.id);
    res.json({ ...inquiry, reflections });
  });

  app.post(api.inquiries.upsert.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.inquiries.upsert.input.parse(req.body);
    const inquiry = await storage.createOrUpdateInquiry({ ...input, userId: req.user.id });
    res.json(inquiry);
  });

  app.delete('/api/reflections/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const reflectionId = Number(req.params.id);
    const reflection = await storage.getReflectionById(reflectionId);
    
    if (!reflection) {
      return res.status(404).json({ message: "Reflection not found" });
    }
    
    // Verify ownership: check if the reflection's inquiry belongs to this user
    const inquiry = await storage.getInquiryByUserId(req.user.id);
    if (!inquiry || reflection.inquiryId !== inquiry.id) {
      return res.status(403).json({ message: "Not authorized to delete this reflection" });
    }
    
    await storage.deleteReflection(reflectionId);
    res.json({ success: true });
  });

  app.get(api.inquiries.listAll.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const inquiries = await storage.getAllInquiries();
    res.json(inquiries);
  });

  app.post(api.inquiries.addComment.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.inquiries.addComment.input.parse(req.body);
    const comment = await storage.addInquiryComment({ ...input, userId: req.user.id });
    res.status(201).json(comment);
  });

  // === REFLECTIONS ===
  app.post(api.reflections.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.reflections.create.input.parse(req.body);
    const reflection = await storage.createReflection(input);
    
    // Auto-index for AI (use visibility from input, default to private)
    try {
      const visibility = (input.visibility || "private") as "private" | "group" | "cohort";
      await indexContent(
        "reflection",
        reflection.id,
        req.user.id,
        input.content,
        undefined,
        { weekOf: input.weekOf },
        visibility
      );
    } catch (e) {
      console.error("Failed to index reflection for AI:", e);
    }
    
    res.status(201).json(reflection);
  });

  // === RESOURCES ===
  app.get(api.resources.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resources = await storage.getResources();
    res.json(resources);
  });

  app.post(api.resources.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.resources.create.input.parse(req.body);
    const resource = await storage.createResource({ ...input, userId: req.user.id });
    
    // Auto-index for AI (use visibility from input, default to cohort)
    try {
      const visibility = (input.visibility || "cohort") as "private" | "group" | "cohort";
      const contentToIndex = `${input.title}\n\n${input.annotation || ""}\n\n${input.url}`;
      await indexContent(
        "resource",
        resource.id,
        req.user.id,
        contentToIndex,
        undefined,
        { tags: input.tags },
        visibility
      );
    } catch (e) {
      console.error("Failed to index resource for AI:", e);
    }
    
    res.status(201).json(resource);
  });

  // === MEETINGS ===
  app.get(api.meetings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const meetings = await storage.getMeetings();
    res.json(meetings);
  });

  app.post(api.meetings.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.meetings.create.input.parse(req.body);
    const meeting = await storage.createMeeting(input);
    res.status(201).json(meeting);
  });

  app.patch(api.meetings.update.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.meetings.update.input.parse(req.body);
    const meeting = await storage.updateMeeting(Number(req.params.id), input);
    res.json(meeting);
  });

  // === REPORT BUILDER ===
  app.get(api.report.sections.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sections = await storage.getReportSections();
    res.json(sections);
  });

  // Admin section management
  app.post(api.report.createSection.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.report.createSection.input.parse(req.body);
    const section = await storage.createReportSection(input);
    res.status(201).json(section);
  });

  app.patch('/api/admin/report/sections/:id', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.report.updateSection.input.parse(req.body);
    const section = await storage.updateReportSection(Number(req.params.id), input);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  });

  app.delete('/api/admin/report/sections/:id', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    await storage.deleteReportSection(Number(req.params.id));
    res.json({ success: true });
  });

  app.get(api.report.latestVersions.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const version = await storage.getLatestReportVersion(Number(req.params.sectionId));
    res.json(version || null);
  });

  app.get(api.report.history.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const history = await storage.getReportHistory(Number(req.params.sectionId));
    res.json(history);
  });

  app.post(api.report.saveVersion.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.report.saveVersion.input.parse(req.body);
    const version = await storage.createReportVersion({ ...input, userId: req.user.id });
    
    // Auto-index for AI (use visibility from input, default to cohort)
    try {
      const visibility = (input.visibility || "cohort") as "private" | "group" | "cohort";
      await indexContent(
        "report_post",
        version.id,
        req.user.id,
        input.content,
        input.sectionId,
        { justiceLensTags: input.justiceLensTags },
        visibility
      );
    } catch (e) {
      console.error("Failed to index report version for AI:", e);
    }
    
    res.status(201).json(version);
  });

  app.get(api.report.comments.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const comments = await storage.getComments(Number(req.params.sectionId));
    res.json(comments);
  });

  app.post(api.report.addComment.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.report.addComment.input.parse(req.body);
    const comment = await storage.createComment({ ...input, userId: req.user.id });
    
    // Auto-index for AI
    try {
      await indexContent(
        "comment",
        comment.id,
        req.user.id,
        input.content,
        input.sectionId,
        {},
        "cohort"
      );
    } catch (e) {
      console.error("Failed to index comment for AI:", e);
    }
    
    res.status(201).json(comment);
  });

  // === POST READS & REACTIONS ===
  app.get('/api/report/versions/engagement', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const versions = await storage.getAllVersionsWithEngagement();
    res.json(versions);
  });

  app.get('/api/report/my-reads', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const readIds = await storage.getUserReadVersionIds(req.user.id);
    res.json(readIds);
  });

  app.post('/api/report/versions/:id/read', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const versionId = Number(req.params.id);
    const read = await storage.markVersionRead(versionId, req.user.id);
    res.json(read);
  });

  app.get('/api/report/versions/:id/reads', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const versionId = Number(req.params.id);
    const reads = await storage.getVersionReads(versionId);
    res.json(reads);
  });

  app.post('/api/report/versions/:id/reactions', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const versionId = Number(req.params.id);
    const schema = z.object({ reactionType: z.string() });
    const { reactionType } = schema.parse(req.body);
    const result = await storage.toggleReaction(versionId, req.user.id, reactionType);
    res.json(result);
  });

  app.get('/api/report/versions/:id/reactions', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const versionId = Number(req.params.id);
    const reactions = await storage.getVersionReactions(versionId);
    res.json(reactions);
  });

  // === COHORT INFO ===
  app.get('/api/cohort/user-count', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getAllUsers();
    res.json({ count: users.length });
  });

  // === SETTINGS ===
  app.get(api.settings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.settings.update.input.parse(req.body);
    const setting = await storage.updateSetting(input);
    res.json(setting);
  });

  // === USER MANAGEMENT ===
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const users = await storage.getAllUsers();
    // Properly exclude passwords from response
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  });

  app.patch('/api/admin/users/:id/role', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.users.updateRole.input.parse(req.body);
    const user = await storage.updateUserRole(Number(req.params.id), input.isAdmin);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch('/api/admin/users/:id/password', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.users.updatePassword.input.parse(req.body);
    const hashedPassword = await hashPassword(input.password);
    const user = await storage.updateUserPassword(Number(req.params.id), hashedPassword);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true });
  });

  // === SELF-SERVICE ACCOUNT MANAGEMENT ===
  app.patch(api.users.updateOwnUsername.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.users.updateOwnUsername.input.parse(req.body);
    // Check if username is already taken
    const existing = await storage.getUserByUsername(input.username);
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const user = await storage.updateUserUsername(req.user.id, input.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch(api.users.updateOwnPassword.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.users.updateOwnPassword.input.parse(req.body);
    // Verify current password
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValid = await comparePasswords(input.currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const hashedPassword = await hashPassword(input.newPassword);
    await storage.updateUserPassword(req.user.id, hashedPassword);
    res.json({ success: true });
  });

  // === JUSTICE LENSES ===
  app.get(api.justiceLenses.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const lenses = await storage.getJusticeLenses();
    res.json(lenses);
  });

  app.post(api.justiceLenses.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.justiceLenses.create.input.parse(req.body);
    const lens = await storage.createJusticeLens(input);
    res.status(201).json(lens);
  });

  app.patch('/api/admin/justice-lenses/:id', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.justiceLenses.update.input.parse(req.body);
    const lens = await storage.updateJusticeLens(Number(req.params.id), input);
    if (!lens) {
      return res.status(404).json({ message: "Justice lens not found" });
    }
    res.json(lens);
  });

  app.delete('/api/admin/justice-lenses/:id', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const deleted = await storage.deleteJusticeLens(Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Justice lens not found" });
    }
    res.json({ success: true });
  });

  // === INQUIRY MAPPINGS ===
  app.get(api.inquiryMappings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const mappings = await storage.getInquiryMappings();
    res.json(mappings);
  });

  app.get(api.inquiryMappings.active.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const mapping = await storage.getActiveMapping();
    res.json(mapping || null);
  });

  app.post(api.inquiryMappings.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.inquiryMappings.create.input.parse(req.body);
    const mapping = await storage.createInquiryMapping(input);
    res.status(201).json(mapping);
  });

  app.patch(api.inquiryMappings.update.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const input = api.inquiryMappings.update.input.parse(req.body);
    const mapping = await storage.updateInquiryMapping(Number(req.params.id), input);
    if (!mapping) {
      return res.status(404).json({ message: "Mapping not found" });
    }
    res.json(mapping);
  });

  app.delete(api.inquiryMappings.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    await storage.deleteInquiryMapping(Number(req.params.id));
    res.json({ success: true });
  });

  app.post(api.inquiryMappings.setActive.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    await storage.setActiveMapping(Number(req.params.id));
    res.json({ success: true });
  });

  app.get(api.inquiryMappings.sectionMappings.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const mappings = await storage.getSectionLensMappings(Number(req.params.id));
    res.json(mappings);
  });

  app.post(api.inquiryMappings.saveSectionMappings.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const mappingId = Number(req.params.id);
    const input = api.inquiryMappings.saveSectionMappings.input.parse(req.body);
    const mappingsWithId = input.map(m => ({ ...m, mappingId }));
    await storage.saveSectionLensMappings(mappingId, mappingsWithId);
    res.json({ success: true });
  });

  app.get(api.inquiryMappings.getFocusContexts.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const contexts = await storage.getSectionFocusContexts(Number(req.params.id));
    res.json(contexts);
  });

  app.post(api.inquiryMappings.saveFocusContexts.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    const mappingId = Number(req.params.id);
    const input = api.inquiryMappings.saveFocusContexts.input.parse(req.body);
    const contextsWithId = input.map(c => ({ ...c, mappingId }));
    await storage.saveSectionFocusContexts(mappingId, contextsWithId);
    res.json({ success: true });
  });

  // === AI INSIGHTS ===
  app.get('/api/ai/settings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await getUserAiSettings(req.user.id);
    res.json(settings);
  });

  app.patch('/api/ai/settings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const schema = z.object({ includePrivateInAI: z.boolean() });
    const { includePrivateInAI } = schema.parse(req.body);
    await updateUserAiSettings(req.user.id, includePrivateInAI);
    res.json({ success: true });
  });

  app.post('/api/ai/journey-summary', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const summary = await generateJourneySummary(req.user.id);
      res.json(summary);
    } catch (error) {
      console.error("Error generating journey summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post('/api/ai/section-synthesis/:sectionId', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sectionId = Number(req.params.sectionId);
    try {
      const synthesis = await generateSectionSynthesis(sectionId);
      res.json(synthesis);
    } catch (error) {
      console.error("Error generating section synthesis:", error);
      res.status(500).json({ message: "Failed to generate synthesis" });
    }
  });

  app.get('/api/ai/summaries', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const type = req.query.type as string | undefined;
    const summaries = await getRecentSummaries(req.user.id, type);
    res.json(summaries);
  });

  app.get('/api/ai/section-summaries/:sectionId', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sectionId = Number(req.params.sectionId);
    const summaries = await getSectionSummaries(sectionId);
    res.json(summaries);
  });

  // Re-index existing content for AI (admin only)
  app.post('/api/ai/reindex', async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) return res.sendStatus(401);
    
    try {
      // Index all existing report versions
      const versions = await storage.getAllReportVersions();
      for (const v of versions) {
        await indexContent("report_post", v.id, v.userId, v.content, v.sectionId, { justiceLensTags: v.justiceLensTags }, "cohort");
      }
      
      // Index all existing reflections
      const allReflections = await storage.getAllReflections();
      for (const r of allReflections) {
        const inquiry = await storage.getInquiryById(r.inquiryId);
        if (inquiry) {
          await indexContent("reflection", r.id, inquiry.userId, r.content, undefined, { weekOf: r.weekOf }, "private");
        }
      }
      
      res.json({ success: true, indexed: { versions: versions.length, reflections: allReflections.length } });
    } catch (error) {
      console.error("Reindex error:", error);
      res.status(500).json({ message: "Failed to reindex content" });
    }
  });

  // === SEED DATA ===
  await seedData();

  return httpServer;
}

async function seedData() {
  // Seed admin user
  if (!(await storage.getUserByUsername('admin'))) {
    const hashedPassword = await hashPassword('admin123');
    await storage.createUser({
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'admin',
      isAdmin: true
    });
  }

  // Seed settings
  if (!(await storage.getSetting('magic_code'))) {
    await storage.updateSetting({ key: 'magic_code', value: 'cohort2026' });
    await storage.updateSetting({ key: 'cohort_name', value: 'Inquiry Cohort 2026' });
  }

  if (!(await storage.getSetting('cohort_start'))) {
    await storage.updateSetting({ key: 'cohort_start', value: '2026-01-13' });
    await storage.updateSetting({ key: 'cohort_end', value: '2026-07-01' });
  }

  // Seed report outline
  const sections = [
    { title: "Introduction/Context", orderIndex: 1, slug: "intro", description: "Describe the context of your inquiry and why it matters." },
    { title: "Inquiry Question(s)", orderIndex: 2, slug: "question", description: "State your core research question(s)." },
    { title: "Methods / Learning Pathway", orderIndex: 3, slug: "methods", description: "What did you do? Books read, tools tested, etc." },
    { title: "Key Insights", orderIndex: 4, slug: "insights", description: "What were your major findings?" },
    { title: "Ethical & Justice Considerations", orderIndex: 5, slug: "ethics", description: "Apply the justice lenses here." },
    { title: "Implications for Practice", orderIndex: 6, slug: "implications", description: "How does this change our work?" },
    { title: "Recommendations / Next Steps", orderIndex: 7, slug: "recommendations", description: "What should happen next?" },
    { title: "References", orderIndex: 8, slug: "references", description: "Cite your sources." },
  ];
  await storage.seedReportSections(sections);

  // Seed justice lenses
  const lenses = [
    { slug: "who_benefits", label: "Who benefits?", orderIndex: 1 },
    { slug: "who_is_harmed", label: "Who is harmed?", orderIndex: 2 },
    { slug: "labor", label: "Invisible Labor", orderIndex: 3 },
    { slug: "power", label: "Power Dynamics", orderIndex: 4 },
  ];
  await storage.seedJusticeLenses(lenses);

  // Seed sample meeting
  const meetings = await storage.getMeetings();
  if (meetings.length === 0) {
    await storage.createMeeting({
      date: new Date("2026-01-20T17:00:00"),
      title: "Kickoff Meeting",
      agenda: "1. Introductions\n2. Review Syllabus\n3. Assign Groups",
      notes: "Welcome everyone!",
      zoomLink: "https://zoom.us/j/example"
    });
  }
}
