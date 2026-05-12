import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export type VerificationLevel = "unverified" | "contributor" | "maintainer";
export type RepoPermission =
  | "none"
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin"
  | "unknown";

export type LocLanguageStats = {
  files: number;
  blank: number;
  comment: number;
  code: number;
};

export type LocByLanguage = Record<string, LocLanguageStats>;

export type ReviewSummaryPair = {
  label: string;
  count: number;
};

export const repository = pgTable("repository", {
  id: uuid("id").primaryKey().defaultRandom(),
  repoUrl: text("repo_url").notNull().unique(),
  repoSlug: text("repo_slug").notNull().unique(),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  status: text("status", { enum: ["pending", "completed"] })
    .default("pending")
    .notNull(),
  verificationLevel: text("verification_level", {
    enum: ["unverified", "contributor", "maintainer"],
  })
    .default("unverified")
    .notNull(),
  activeSubmissionId: uuid("active_submission_id"),
  verifiedBySubmissionId: uuid("verified_by_submission_id"),
  verifiedByUserId: text("verified_by_user_id").references(() => user.id, { onDelete: "set null" }),
  verifiedAt: timestamp("verified_at"),
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
  locTotal: integer("loc_total"),
  locFiles: integer("loc_files"),
  locBlank: integer("loc_blank"),
  locComment: integer("loc_comment"),
  locByLanguage: jsonb("loc_by_language").$type<LocByLanguage>().default({}).notNull(),
  clocOutputRaw: text("cloc_output_raw"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  completedAt: timestamp("completed_at"),
});

export const reviewRequestSubmission = pgTable(
  "review_request_submission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repository.id, { onDelete: "cascade" }),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verificationLevel: text("verification_level", {
      enum: ["unverified", "contributor", "maintainer"],
    })
      .default("unverified")
      .notNull(),
    requesterRepoPermission: text("requester_repo_permission", {
      enum: ["none", "read", "triage", "write", "maintain", "admin", "unknown"],
    })
      .default("unknown")
      .notNull(),
    /** markdown */
    notes: text("notes").notNull(),
    locTotal: integer("loc_total"),
    locFiles: integer("loc_files"),
    locBlank: integer("loc_blank"),
    locComment: integer("loc_comment"),
    locByLanguage: jsonb("loc_by_language").$type<LocByLanguage>().default({}).notNull(),
    clocOutputRaw: text("cloc_output_raw"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("review_request_submission_repository_idx").on(table.repositoryId),
    index("review_request_submission_requester_idx").on(table.requesterId),
  ],
);

export const reviewReport = pgTable(
  "review_report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repository.id, { onDelete: "cascade" }),
    donorId: text("donor_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    markdown: text("markdown").notNull(),
    provider: text("provider", { enum: ["claude", "codex", "other"] }).notNull(),
    modelName: text("model_name"),
    summaryPairs: jsonb("summary_pairs").$type<ReviewSummaryPair[]>().default([]).notNull(),
    criticalCount: integer("critical_count").default(0).notNull(),
    highCount: integer("high_count").default(0).notNull(),
    mediumCount: integer("medium_count").default(0).notNull(),
    lowCount: integer("low_count").default(0).notNull(),
    informationalCount: integer("informational_count").default(0).notNull(),
    totalCount: integer("total_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("review_report_repository_idx").on(table.repositoryId)],
);

export const repositoryRelations = relations(repository, ({ one, many }) => ({
  activeSubmission: one(reviewRequestSubmission, {
    fields: [repository.activeSubmissionId],
    references: [reviewRequestSubmission.id],
  }),
  verifiedByUser: one(user, {
    fields: [repository.verifiedByUserId],
    references: [user.id],
  }),
  submissions: many(reviewRequestSubmission),
  report: one(reviewReport, {
    fields: [repository.id],
    references: [reviewReport.repositoryId],
  }),
}));

export const reviewRequestSubmissionRelations = relations(reviewRequestSubmission, ({ one }) => ({
  repository: one(repository, {
    fields: [reviewRequestSubmission.repositoryId],
    references: [repository.id],
  }),
  requester: one(user, {
    fields: [reviewRequestSubmission.requesterId],
    references: [user.id],
  }),
}));

export const reviewReportRelations = relations(reviewReport, ({ one }) => ({
  repository: one(repository, {
    fields: [reviewReport.repositoryId],
    references: [repository.id],
  }),
  donor: one(user, {
    fields: [reviewReport.donorId],
    references: [user.id],
  }),
}));
