import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const reviewRequest = pgTable("review_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  repoUrl: text("repo_url").notNull().unique(),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  description: text("description").notNull(),
  securityNotes: text("security_notes"),
  ghDescription: text("gh_description"),
  ghStars: integer("gh_stars"),
  ghForks: integer("gh_forks"),
  ghOpenIssues: integer("gh_open_issues"),
  ghLanguage: text("gh_language"),
  ghTopics: jsonb("gh_topics").$type<string[]>().default([]).notNull(),
  ghLicense: text("gh_license"),
  ghDefaultBranch: text("gh_default_branch"),
  ghPushedAt: timestamp("gh_pushed_at"),
  ghOwnerAvatarUrl: text("gh_owner_avatar_url"),
  ghOwnerType: text("gh_owner_type"),
  ghHomepage: text("gh_homepage"),
  ghArchived: boolean("gh_archived"),
  ghFetchedAt: timestamp("gh_fetched_at"),
  requesterId: text("requester_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "completed"] })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  completedAt: timestamp("completed_at"),
});

export const reviewReport = pgTable("review_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => reviewRequest.id, { onDelete: "cascade" }),
  donorId: text("donor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  markdown: text("markdown").notNull(),
  provider: text("provider", { enum: ["claude", "codex", "other"] }).notNull(),
  modelName: text("model_name"),
  criticalCount: integer("critical_count").default(0).notNull(),
  highCount: integer("high_count").default(0).notNull(),
  mediumCount: integer("medium_count").default(0).notNull(),
  lowCount: integer("low_count").default(0).notNull(),
  informationalCount: integer("informational_count").default(0).notNull(),
  totalCount: integer("total_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewRequestRelations = relations(reviewRequest, ({ one }) => ({
  requester: one(user, {
    fields: [reviewRequest.requesterId],
    references: [user.id],
  }),
  report: one(reviewReport, {
    fields: [reviewRequest.id],
    references: [reviewReport.requestId],
  }),
}));

export const reviewReportRelations = relations(reviewReport, ({ one }) => ({
  request: one(reviewRequest, {
    fields: [reviewReport.requestId],
    references: [reviewRequest.id],
  }),
  donor: one(user, {
    fields: [reviewReport.donorId],
    references: [user.id],
  }),
}));
