import { db } from "./db";
import { 
  users, inquiries, reflections, resources, meetings, reportSections, reportVersions, comments, appSettings,
  type User, type Inquiry, type Reflection, type Resource, type Meeting, type ReportSection, type ReportVersion, type Comment, type AppSetting,
  type InsertUser, type InsertInquiry, type InsertReflection, type InsertResource, type InsertMeeting, type InsertReportVersion, type InsertComment, type InsertSetting
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
  
  // Inquiries & Reflections
  getInquiryByUserId(userId: number): Promise<Inquiry | undefined>;
  createOrUpdateInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getReflections(inquiryId: number): Promise<Reflection[]>;
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
  getAllInquiries(): Promise<(Inquiry & { user: User, reflections: Reflection[], comments: (any)[] })[]>;
  addInquiryComment(comment: any): Promise<any>;

  // Report
  getReportSections(): Promise<ReportSection[]>;
  getLatestReportVersion(sectionId: number): Promise<(ReportVersion & { author: User }) | undefined>;
  getReportHistory(sectionId: number): Promise<(ReportVersion & { author: User })[]>;
  createReportVersion(version: InsertReportVersion): Promise<ReportVersion>;
  getComments(sectionId: number): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Settings
  getSettings(): Promise<AppSetting[]>;
  getSetting(key: string): Promise<AppSetting | undefined>;
  updateSetting(setting: InsertSetting): Promise<AppSetting>;

  // Seeding helpers
  seedReportSections(sections: InsertReportSection[]): Promise<void>;
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

  async getAllInquiries(): Promise<(Inquiry & { user: User, reflections: Reflection[], comments: (any)[] })[]> {
    return await db.query.inquiries.findMany({
      with: {
        user: true,
        reflections: {
          orderBy: desc(reflections.createdAt)
        },
      }
    }) as any;
  }

  async addInquiryComment(comment: any): Promise<any> {
    const [newComment] = await db.insert((schema as any).inquiryComments).values(comment).returning();
    return newComment;
  }

  async getReportSections(): Promise<ReportSection[]> {
    return await db.select().from(reportSections).orderBy(reportSections.orderIndex);
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
}

export const storage = new DatabaseStorage();
