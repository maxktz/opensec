# DeepSec.me MVP Scope

## Product Summary

DeepSec.me is a lightweight coordination platform for donated AI security reviews of open source projects.

Maintainers and community members can request a DeepSec review for a public GitHub repository. Donors with available AI subscription capacity can run DeepSec manually, paste the generated Markdown report, and receive public credit for the donation.

The platform does not run DeepSec itself in the MVP. It coordinates requests, stores submitted reports privately, publishes safe metadata, and tracks donor contribution stats.

## Problem

DeepSec-style AI security analysis is valuable but expensive in tokens. Many open source maintainers cannot afford to run it, while some developers have unused capacity on high-tier Claude or Codex subscriptions.

The current workaround is informal: maintainers ask friends with subscriptions to run the tool and send back a Markdown report. DeepSec.me turns that informal favor network into a simple public queue with attribution.

## MVP Goal

Ship a working app where:

1. A GitHub-authenticated user requests a review for a public GitHub repository.
2. Another GitHub-authenticated user submits a DeepSec Markdown report for that request.
3. The full report remains private to the requester/maintainer-facing view.
4. Public pages show safe review metadata, donor attribution, and aggregate severity counts.
5. Donor profiles show contribution stats to encourage more donated reviews.

## Non-Goals

- Running DeepSec inside the app.
- Managing or verifying Claude/Codex subscriptions.
- Payments, credits, or bounties.
- Private repository support.
- Full report publication.
- GitHub issue or pull request automation.
- Repository ownership enforcement.
- Comments, discussion threads, or triage workflows.
- Report quality scoring.
- Admin/moderation tooling.
- Notifications.
- Multiple competing reports per request as a first-class workflow.

## Users

### Requester

Any GitHub-authenticated user who submits a public repository for review.

For MVP, the requester does not need to prove repository ownership. This keeps request submission fast and allows community members to request reviews for projects they care about.

### Donor

Any GitHub-authenticated user who runs DeepSec manually and submits the resulting Markdown report.

Donors do not need to claim a request before submitting. They can open any pending request and paste a completed report.

### Public Visitor

Unauthenticated users can see the landing page, pending requests, recent completed reviews, donor stats, and public metadata. They cannot request or submit reviews until they sign in.

## Core Flows

### Request A Review

1. User signs in with GitHub.
2. User opens the request form.
3. User enters a public GitHub repository URL.
4. User optionally adds project description and security-sensitive areas.
5. App validates the URL shape and normalizes owner/name.
6. App creates a pending review request.
7. Request appears publicly in the pending queue.

### Submit A Review

1. Donor signs in with GitHub.
2. Donor browses pending review requests.
3. Donor independently runs DeepSec locally or in their coding-agent environment.
4. Donor opens the request detail page.
5. Donor pastes the generated Markdown report.
6. Donor selects the model/provider used.
7. Donor enters severity counts from the report.
8. Donor submits the report.
9. Request becomes completed.
10. Public pages show safe metadata and donor attribution.
11. Full Markdown remains private.

### View Completed Review Metadata

1. Visitor opens a completed review page.
2. Visitor sees repository, requester, donor, model/provider, completion date, and severity counts.
3. Visitor does not see the full Markdown report.

### View Private Report

1. Requester signs in.
2. Requester opens their completed request.
3. App shows the full Markdown report.

For MVP, private report access is scoped to the user who created the request. Repository ownership-based access can be added later.

## Privacy Model

Full DeepSec reports may contain sensitive vulnerability details. They must not be public by default.

Publicly visible data:

- Repository owner/name and URL.
- Requester GitHub identity.
- Donor GitHub identity.
- Review status.
- Model/provider used.
- Completion date.
- Total issue count.
- Severity counts: critical, high, medium, low, informational.

Private data:

- Full Markdown report.
- Any detailed vulnerability descriptions from the report.
- Any reproduction steps or exploit details.

## Pages

### Landing Page

Purpose: explain the product, show social proof, and route users into request/donation flows.

Must include:

- Hero: donated AI security reviews for open source.
- Primary CTA: request a review.
- Secondary CTA: donate a review.
- Recent completed reviews with severity summaries.
- Top donors.
- Pending repositories needing review.
- Short explanation of how it works.

### Login Page

Purpose: GitHub authentication entry point.

MVP authentication should use the existing Better Auth setup and GitHub as the primary provider.

### Request Review Page

Fields:

- GitHub repository URL.
- Project description.
- Security-sensitive areas or review notes.

Rules:

- User must be signed in.
- Repository must be public-facing by URL.
- One active pending/completed request per repository is preferred for MVP to avoid duplicate spam.

### Pending Reviews Page

Shows all requests that do not yet have a submitted report.

Each item should show:

- Repository owner/name.
- Requester.
- Created date.
- Description excerpt.
- Link to submit a review.

No claim button is needed in MVP.

### Review Detail Page

For pending requests:

- Repository details.
- Request description.
- Security notes.
- Donor instructions.
- Submit report form for signed-in users.

For completed requests:

- Public metadata.
- Severity counts.
- Donor attribution.
- Private Markdown report if the current user is allowed to view it.

### Submit Report Form

Fields:

- Markdown report textarea.
- Model/provider used: Claude, Codex, Other.
- Optional model name text field.
- Critical count.
- High count.
- Medium count.
- Low count.
- Informational count.

MVP uses manual severity count entry. Automated parsing can come later.

### User Profile Page

Shows:

- GitHub avatar/name.
- Reviews requested.
- Reviews donated.
- Completed donation history.
- Public aggregate stats.

## Data Model

The existing Better Auth `user` table remains the source of authenticated users.

### review_request

- `id`
- `repo_url`
- `repo_owner`
- `repo_name`
- `description`
- `security_notes`
- `requester_id`
- `status`: `pending` or `completed`
- `created_at`
- `updated_at`
- `completed_at`

### review_report

- `id`
- `request_id`
- `donor_id`
- `markdown`
- `provider`: `claude`, `codex`, or `other`
- `model_name`
- `critical_count`
- `high_count`
- `medium_count`
- `low_count`
- `informational_count`
- `total_count`
- `created_at`

## Access Rules

- Anyone can view public pages and public metadata.
- Only signed-in users can create review requests.
- Only signed-in users can submit reports.
- Full report Markdown is visible only to the requester in MVP.
- Donors can see the report they submitted.
- Requesters should not be blocked from submitting reports to their own requests, but donor credit should still show truthfully as their own submission.

## Abuse Constraints

MVP constraints should stay simple:

- GitHub login required for write actions.
- Only GitHub repository URLs are accepted.
- Avoid duplicate active requests for the same repository.
- Markdown is rendered safely, without raw HTML execution.
- Public pages never expose full report Markdown.

No admin dashboard or moderation queue is required for MVP.

## Tech Stack

Use the existing repository stack:

- Next.js app in `apps/web`.
- Better Auth for GitHub login.
- oRPC for typed API/business logic.
- Drizzle ORM for database schema and queries.
- PostgreSQL on Neon.
- Vercel deployment.
- Shared shadcn-style UI components from `packages/ui`.
- Bun/Turborepo scripts from the current monorepo.

## Implementation Milestones

### Milestone 1: Data And Auth Foundation

- Ensure GitHub auth works through Better Auth.
- Add review request schema.
- Add review report schema.
- Add API routes/procedures for creating requests, listing requests, viewing details, and submitting reports.

### Milestone 2: Request Flow

- Build request form.
- Normalize GitHub repo URLs into owner/name.
- Save pending requests.
- Show pending request list.

### Milestone 3: Donor Submission Flow

- Build pending review detail page.
- Add donor instructions for running DeepSec manually.
- Add Markdown report submission form.
- Store private report and public severity metadata.
- Mark request completed after submission.

### Milestone 4: Public Metadata And Profiles

- Build completed review metadata view.
- Build landing page sections for recent completions, top donors, and pending requests.
- Build user profile pages with donation/request stats.

### Milestone 5: Polish And Verification

- Validate required fields.
- Ensure private report access rules are enforced server-side.
- Ensure Markdown rendering is safe.
- Run typecheck/lint/build checks.
- Deploy to Vercel.

## MVP Success Criteria

The MVP is successful when a real user can:

1. Sign in with GitHub.
2. Request a review for a public repository.
3. See that request appear in the public queue.
4. Sign in as another user.
5. Paste a DeepSec Markdown report for that request.
6. See public completion metadata without exposing the report body.
7. See donor credit reflected on the donor profile.
8. Let the requester view the private full report.

## Later Ideas

- Repository ownership verification through GitHub API.
- Maintainer approval before a request becomes public.
- Maintainer-controlled report sharing links.
- Private repo support.
- Automated severity extraction from Markdown.
- Multiple donor submissions per repository.
- Report comments and maintainer triage.
- GitHub issue creation from accepted findings.
- Admin moderation tools.
- Donor reputation and badges.
- Organization profiles.
- Notifications by email or GitHub.
- DeepSec run templates for Claude Code, Codex, and other agents.
