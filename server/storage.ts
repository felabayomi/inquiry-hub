import { db } from "./db";
import { 
  users, inquiries, reflections, resources, meetings, reportSections, reportVersions, comments, appSettings, inquiryComments, justiceLenses, postReads, postReactions,
  type User, type Inquiry, type Reflection, type Resource, type Meeting, type ReportSection, type ReportVersion, type Comment, type AppSetting, type InquiryComment, type JusticeLens, type PostRead, type PostReaction,
  type InsertUser, type InsertInquiry, type InsertReflection, type InsertResource, type InsertMeeting, type InsertReportVersion, type InsertComment, type InsertSetting, type InsertInquiryComment, type InsertReportSection, type InsertJusticeLens, type InsertPostRead, type InsertPostReaction
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, isAdmin: boolean): Promise<User | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined>;
  updateUserUsername(id: number, username: string): Promise<User | undefined>;
  
  // Inquiries & Reflections
  getInquiryByUserId(userId: number): Promise<Inquiry | undefined>;
  createOrUpdateInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getReflections(inquiryId: number): Promise<Reflection[]>;
  getReflectionById(id: number): Promise<Reflection | undefined>;
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  deleteReflection(id: number): Promise<void>;

  // Resources
  getResources(): Promise<(Resource & { user: User })[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Meetings
  getMeetings(): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, updates: Partial<InsertMeeting>): Promise<Meeting>;

  // Admin Cohort Overview
  getAllInquiries(): Promise<(Inquiry & { user: User, reflections: Reflection[], comments: (InquiryComment & { user: User })[] })[]>;
  getInquiryComments(inquiryId: number): Promise<(InquiryComment & { user: User })[]>;
  addInquiryComment(comment: InsertInquiryComment): Promise<InquiryComment>;

  // Report
  getReportSections(): Promise<ReportSection[]>;
  createReportSection(section: InsertReportSection): Promise<ReportSection>;
  updateReportSection(id: number, section: Partial<InsertReportSection>): Promise<ReportSection | undefined>;
  deleteReportSection(id: number): Promise<void>;
  getLatestReportVersion(sectionId: number): Promise<(ReportVersion & { author: User }) | undefined>;
  getReportHistory(sectionId: number): Promise<(ReportVersion & { author: User })[]>;
  createReportVersion(version: InsertReportVersion): Promise<ReportVersion>;
  getComments(sectionId: number): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Settings
  getSettings(): Promise<AppSetting[]>;
  getSetting(key: string): Promise<AppSetting | undefined>;
  updateSetting(setting: InsertSetting): Promise<AppSetting>;

  // Justice Lenses
  getJusticeLenses(): Promise<JusticeLens[]>;
  createJusticeLens(lens: InsertJusticeLens): Promise<JusticeLens>;
  updateJusticeLens(id: number, lens: Partial<InsertJusticeLens>): Promise<JusticeLens | undefined>;
  deleteJusticeLens(id: number): Promise<boolean>;

  // Post Reads & Reactions
  markVersionRead(versionId: number, userId: number): Promise<PostRead>;
  getVersionReads(versionId: number): Promise<(PostRead & { user: User })[]>;
  getUserReadVersionIds(userId: number): Promise<number[]>;
  toggleReaction(versionId: number, userId: number, reactionType: string): Promise<{ added: boolean }>;
  getVersionReactions(versionId: number): Promise<(PostReaction & { user: User })[]>;
  getAllVersionsWithEngagement(): Promise<(ReportVersion & { author: User, reads: (PostRead & { user: User })[], reactions: (PostReaction & { user: User })[] })[]>;

  // Seeding helpers
  seedReportSections(sections: InsertReportSection[]): Promise<void>;
  seedJusticeLenses(lenses: InsertJusticeLens[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: number, isAdmin: boolean): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ isAdmin, role: isAdmin ? 'admin' : 'member' })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async updateUserUsername(id: number, username: string): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ username })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getInquiryByUserId(userId: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.userId, userId));
    return inquiry;
  }

  async createOrUpdateInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    // Check if exists
    const existing = await this.getInquiryByUserId(inquiry.userId);
    if (existing) {
      const [updated] = await db.update(inquiries)
        .set({ ...inquiry })
        .where(eq(inquiries.id, existing.id))
        .returning();
      return updated;
    }
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async getReflections(inquiryId: number): Promise<Reflection[]> {
    return await db.select().from(reflections)
      .where(eq(reflections.inquiryId, inquiryId))
      .orderBy(desc(reflections.createdAt));
  }

  async createReflection(reflection: InsertReflection): Promise<Reflection> {
    const [newReflection] = await db.insert(reflections).values(reflection).returning();
    return newReflection;
  }

  async getReflectionById(id: number): Promise<Reflection | undefined> {
    const [reflection] = await db.select().from(reflections).where(eq(reflections.id, id));
    return reflection;
  }

  async deleteReflection(id: number): Promise<void> {
    await db.delete(reflections).where(eq(reflections.id, id));
  }

  async getResources(): Promise<(Resource & { user: User })[]> {
    return await db.query.resources.findMany({
      with: { user: true },
      orderBy: desc(resources.createdAt)
    });
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async getMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings).orderBy(desc(meetings.date));
  }

  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [newMeeting] = await db.insert(meetings).values(meeting).returning();
    return newMeeting;
  }

  async updateMeeting(id: number, updates: Partial<InsertMeeting>): Promise<Meeting> {
    const [updated] = await db.update(meetings)
      .set(updates)
      .where(eq(meetings.id, id))
      .returning();
    return updated;
  }

  async getAllInquiries(): Promise<(Inquiry & { user: User, reflections: Reflection[], comments: (InquiryComment & { user: User })[] })[]> {
    const results = await db.query.inquiries.findMany({
      with: {
        user: true,
        reflections: {
          orderBy: desc(reflections.createdAt)
        },
      }
    });
    
    // Get comments for each inquiry
    const inquiriesWithComments = await Promise.all(
      results.map(async (inquiry) => {
        const comments = await this.getInquiryComments(inquiry.id);
        return { ...inquiry, comments };
      })
    );
    
    return inquiriesWithComments;
  }

  async getInquiryComments(inquiryId: number): Promise<(InquiryComment & { user: User })[]> {
    return await db.query.inquiryComments.findMany({
      where: eq(inquiryComments.inquiryId, inquiryId),
      orderBy: desc(inquiryComments.createdAt),
      with: { user: true }
    });
  }

  async addInquiryComment(comment: InsertInquiryComment): Promise<InquiryComment> {
    const [newComment] = await db.insert(inquiryComments).values(comment).returning();
    return newComment;
  }

  async getReportSections(): Promise<ReportSection[]> {
    return await db.select().from(reportSections).orderBy(reportSections.orderIndex);
  }

  async createReportSection(section: InsertReportSection): Promise<ReportSection> {
    const [newSection] = await db.insert(reportSections).values(section).returning();
    return newSection;
  }

  async updateReportSection(id: number, section: Partial<InsertReportSection>): Promise<ReportSection | undefined> {
    const [updated] = await db.update(reportSections)
      .set(section)
      .where(eq(reportSections.id, id))
      .returning();
    return updated;
  }

  async deleteReportSection(id: number): Promise<void> {
    // Delete related versions and comments first
    await db.delete(reportVersions).where(eq(reportVersions.sectionId, id));
    await db.delete(comments).where(eq(comments.sectionId, id));
    await db.delete(reportSections).where(eq(reportSections.id, id));
  }

  async getLatestReportVersion(sectionId: number): Promise<(ReportVersion & { author: User }) | undefined> {
    return await db.query.reportVersions.findFirst({
      where: eq(reportVersions.sectionId, sectionId),
      orderBy: desc(reportVersions.createdAt),
      with: { author: true }
    });
  }

  async getReportHistory(sectionId: number): Promise<(ReportVersion & { author: User })[]> {
    return await db.query.reportVersions.findMany({
      where: eq(reportVersions.sectionId, sectionId),
      orderBy: desc(reportVersions.createdAt),
      with: { author: true }
    });
  }

  async createReportVersion(version: InsertReportVersion): Promise<ReportVersion> {
    const [newVersion] = await db.insert(reportVersions).values(version).returning();
    return newVersion;
  }

  async getComments(sectionId: number): Promise<(Comment & { author: User })[]> {
    return await db.query.comments.findMany({
      where: eq(comments.sectionId, sectionId),
      orderBy: desc(comments.createdAt),
      with: { author: true }
    });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getSettings(): Promise<AppSetting[]> {
    return await db.select().from(appSettings);
  }

  async getSetting(key: string): Promise<AppSetting | undefined> {
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return setting;
  }

  async updateSetting(setting: InsertSetting): Promise<AppSetting> {
    const [updated] = await db.insert(appSettings)
      .values(setting)
      .onConflictDoUpdate({ target: appSettings.key, set: { value: setting.value } })
      .returning();
    return updated;
  }

  async seedReportSections(sections: InsertReportSection[]): Promise<void> {
    const existing = await this.getReportSections();
    if (existing.length === 0) {
      await db.insert(reportSections).values(sections);
    }
  }

  async getJusticeLenses(): Promise<JusticeLens[]> {
    return await db.select().from(justiceLenses).orderBy(justiceLenses.orderIndex);
  }

  async createJusticeLens(lens: InsertJusticeLens): Promise<JusticeLens> {
    const [newLens] = await db.insert(justiceLenses).values(lens).returning();
    return newLens;
  }

  async updateJusticeLens(id: number, lens: Partial<InsertJusticeLens>): Promise<JusticeLens | undefined> {
    const [updated] = await db.update(justiceLenses)
      .set(lens)
      .where(eq(justiceLenses.id, id))
      .returning();
    return updated;
  }

  async deleteJusticeLens(id: number): Promise<boolean> {
    const result = await db.delete(justiceLenses).where(eq(justiceLenses.id, id)).returning();
    return result.length > 0;
  }

  async seedJusticeLenses(lenses: InsertJusticeLens[]): Promise<void> {
    const existing = await this.getJusticeLenses();
    if (existing.length === 0) {
      await db.insert(justiceLenses).values(lenses);
    }
  }

  async markVersionRead(versionId: number, userId: number): Promise<PostRead> {
    const existing = await db.select().from(postReads)
      .where(and(eq(postReads.versionId, versionId), eq(postReads.userId, userId)));
    if (existing.length > 0) {
      return existing[0];
    }
    const [newRead] = await db.insert(postReads).values({ versionId, userId }).returning();
    return newRead;
  }

  async getVersionReads(versionId: number): Promise<(PostRead & { user: User })[]> {
    return await db.query.postReads.findMany({
      where: eq(postReads.versionId, versionId),
      with: { user: true }
    });
  }

  async getUserReadVersionIds(userId: number): Promise<number[]> {
    const reads = await db.select({ versionId: postReads.versionId })
      .from(postReads)
      .where(eq(postReads.userId, userId));
    return reads.map(r => r.versionId);
  }

  async toggleReaction(versionId: number, userId: number, reactionType: string): Promise<{ added: boolean }> {
    const existing = await db.select().from(postReactions)
      .where(and(
        eq(postReactions.versionId, versionId),
        eq(postReactions.userId, userId),
        eq(postReactions.reactionType, reactionType)
      ));
    if (existing.length > 0) {
      await db.delete(postReactions).where(eq(postReactions.id, existing[0].id));
      return { added: false };
    }
    await db.insert(postReactions).values({ versionId, userId, reactionType }).returning();
    return { added: true };
  }

  async getVersionReactions(versionId: number): Promise<(PostReaction & { user: User })[]> {
    return await db.query.postReactions.findMany({
      where: eq(postReactions.versionId, versionId),
      with: { user: true }
    });
  }

  async getAllVersionsWithEngagement(): Promise<(ReportVersion & { author: User, reads: (PostRead & { user: User })[], reactions: (PostReaction & { user: User })[] })[]> {
    const versions = await db.query.reportVersions.findMany({
      orderBy: desc(reportVersions.createdAt),
      with: { author: true }
    });
    
    const result = await Promise.all(versions.map(async (version) => {
      const reads = await this.getVersionReads(version.id);
      const reactions = await this.getVersionReactions(version.id);
      return { ...version, reads, reactions };
    }));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
