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
