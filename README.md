# TRUSTMARK-AFRICA

TrustMark Africa is an early digital safety platform for reviewing suspicious
messages and organizing private community reports. The initial market is Rwanda.
The product principle is **Verify before you trust.**

## Getting started

Requires Node.js 20.9 or later. PostgreSQL is required for report submission and
alert browsing.

```bash
npm install
npx prisma generate
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local` to your PostgreSQL connection string. Generate
a unique rate-limit secret with `openssl rand -hex 32`, then set it as
`RATE_LIMIT_SECRET`. Do not commit `.env.local` or share its contents. Review
`prisma/migrations/20261031_initial/migration.sql` before applying it.

```bash
npm run db:validate
npm run db:migrate
npm run dev
```

Open http://localhost:3000. The app shell and analyzer work without database
configuration; report submission and alert browsing need the database and
`RATE_LIMIT_SECRET`.

Email-verified registration and sign-in require PostgreSQL, `RATE_LIMIT_SECRET`,
`OTP_SECRET` (at least 32 random bytes), and a Resend account. Set
`RESEND_API_KEY` and `AUTH_EMAIL_FROM` to a sender address verified with Resend.
Apply the registration verification migration before using registration. Codes
are six digits, expire after five minutes, and are limited to five attempts;
resending is available after a one-minute cooldown.

The repository includes `.env.example`, not a working `.env.local`. Copy it to
`.env.local`, replace the example values with your own server credentials, and
restart `npm run dev`. Generate `OTP_SECRET` with `openssl rand -hex 32`; obtain
`RESEND_API_KEY` from Resend and use a sender address verified in that account.
Never paste API keys into chat or commit `.env.local`.

To enable open-ended AI assistance and translation, configure `AI_API_KEY` and
`AI_MODEL` on the server. `AI_BASE_URL` is optional and defaults to the
OpenAI-compatible `https://api.openai.com/v1` endpoint. The provider key never
goes to browser code. Users must consent before their assistant or translation
text is sent to the configured provider. Translation is unavailable until a
provider is configured; common help answers remain local.

## Project layout

- `app/`: App Router pages and API route handlers
- `components/`: shared interface, dashboard, analyzer, and report components
- `lib/`: analysis, Supabase, input validation, and response security helpers
- `prisma/`: database schema starter
- `tests/`: focused unit tests

## Product behavior

- The public landing page shows no invented usage metrics or testimonials.
- Message analysis uses deterministic server-side rules. It does not call an
	LLM or store submitted message text. A LOW result is not a safety guarantee.
- The Help & translation assistant supports Kinyarwanda, English, and French.
	Common support answers can run locally; AI assistance and translation require
	server provider configuration and explicit user consent.
- Reports are stored privately with `PENDING` status. Optional excerpts are
	redacted for common contact details, links, numbers, and credentials; users
	are still warned not to submit sensitive information.
- `/api/alerts` returns only curated alerts whose source report is `REVIEWED`.
	There is no public report listing endpoint.
- Report submission is limited to five requests per network key per 15-minute
	window. The trusted hosting proxy must set `x-forwarded-for`; failed database
	or rate-limit checks fail closed.
- Email/password authentication includes email OTP verification during
	registration. Moderator tools, alert publishing, account deletion, and
	analysis history are not implemented.

## Database and API

The Prisma schema defines users, profiles, hashed-token sessions, optional
analysis metadata, private reports, reviewed alerts, moderation actions, audit
logs, business organizations, memberships, subscriptions, and rate-limit
buckets. Analysis records do not contain full message text.

Migrations are additive on a fresh install and are applied with Prisma. Back up
an existing database and inspect the SQL for name collisions before applying.
This workspace has not applied the migration to a live database.

- `POST /api/analyze`: validate and analyze up to 5,000 characters in memory.
- `POST /api/reports`: validate and store a private pending report.
- `GET /api/reports`: returns `401` until authenticated report access exists.
- `GET /api/alerts`: filtered, reviewed, sanitized public alert records.
- `GET /api/assistant`: returns whether a server-side AI provider is configured.
- `POST /api/assistant`: answers support questions or translates text; AI
	processing requires consent and is rate limited.
- `POST /api/auth/register`: stores a pending registration and emails a
	five-minute verification code.
- `POST /api/auth/verify`: verifies the code and creates the account/session.
- `POST /api/auth/login`: verifies credentials and creates a session.

Responses use generic errors and security headers. No database credential is
exposed to browser code.

## Validation and deployment

```bash
npm run db:generate
npm run db:validate
npm run db:migrate
npm run lint
npx tsc --noEmit
npm test
npm run test:e2e
npm run build
```

Playwright needs browser dependencies. Install them with
`npx playwright install --with-deps chromium` where system package installation
is permitted.

For deployment, configure `DATABASE_URL`, unique `RATE_LIMIT_SECRET` and
`OTP_SECRET` values, `RESEND_API_KEY`, and a verified `AUTH_EMAIL_FROM` sender.
Optionally configure `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL` for translation
and AI help. Store all keys in the host secret manager. Run migrations as a
deployment step, enforce HTTPS at the edge, configure trusted proxy headers,
and verify on staging first. Review
retention, moderation, appeals, deletion, abuse controls, and monitoring before
launching publicly. `/privacy` and `/terms` describe current behavior; they are
not jurisdiction-specific legal advice. No compliance certification is claimed.
The current dependency audit still reports three high advisories in Prisma
6.19.3's `@prisma/config` / `deepmerge-ts` dependency chain; resolving these
requires a Prisma major upgrade and should be completed before production.

## Remaining work

Protected dashboards, moderator/admin workflows, alert publishing,
account/data deletion, retention cleanup, expanded language evaluation, and
operational monitoring remain future phases. The alert feed stays empty until
reviewed alerts are published through a moderation workflow.