import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, double } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ===================== SKY SCHOOL ===================== */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 512 }),
  lessonCount: int("lessonCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  orderIndex: int("orderIndex").default(0).notNull(),
  durationMin: int("durationMin").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const progress = mysqlTable("progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  courseId: int("courseId").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
});

export const learningPaths = mysqlTable("learningPaths", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  goal: text("goal").notNull(),
  pathJson: text("pathJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ===================== GOVERNANCE ===================== */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  ecosystem: mysqlEnum("ecosystem", ["DODGE", "TRUMP"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "passed", "rejected"]).default("active").notNull(),
  votesFor: int("votesFor").default(0).notNull(),
  votesAgainst: int("votesAgainst").default(0).notNull(),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const votes = mysqlTable("votes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  proposalId: int("proposalId").notNull(),
  choice: mysqlEnum("choice", ["for", "against"]).notNull(),
  power: int("power").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const staking = mysqlTable("staking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ecosystem: mysqlEnum("ecosystem", ["DODGE", "TRUMP", "SKY444"]).notNull(),
  amount: double("amount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/* ===================== GAMING ===================== */
export const gameSessions = mysqlTable("gameSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  game: mysqlEnum("game", ["blackjack", "roulette", "tictactoe", "dice", "snake"]).notNull(),
  score: int("score").default(0).notNull(),
  result: varchar("result", { length: 32 }),
  charityDonation: double("charityDonation").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ===================== CHARITY ===================== */
export const charityCampaigns = mysqlTable("charityCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  goalAmount: double("goalAmount").default(0).notNull(),
  raisedAmount: double("raisedAmount").default(0).notNull(),
  mediaUrl: text("mediaUrl"),
  mediaKey: varchar("mediaKey", { length: 512 }),
  milestoneNotified: boolean("milestoneNotified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  campaignId: int("campaignId").notNull(),
  amount: double("amount").notNull(),
  source: varchar("source", { length: 64 }).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ===================== MARKETPLACE ===================== */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  priceSky: double("priceSky").notNull(),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  amount: double("amount").notNull(),
  currency: mysqlEnum("currency", ["SKY444", "DODGE", "TRUMP"]).notNull(),
  status: mysqlEnum("status", ["completed", "pending"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ===================== ANALYTICS ===================== */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  userId: int("userId"),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  module: varchar("module", { length: 64 }),
  value: double("value").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CharityCampaign = typeof charityCampaigns.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
