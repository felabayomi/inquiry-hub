import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
    res.status(201).json(comment);
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
    await storage.updateSetting({ key: 'cohort_name', value: 'Ed.D. AI Inquiry Cohort (Jan-July 2026)' });
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
