# EdBridge Africa

Public website and staff portal for EdBridge Africa, a nonprofit working on education access and disability inclusion in Ghana. The full build plan is in [PLAN.md](PLAN.md).

## Getting started

You need Node 22+ and a local Postgres 17 (for example `brew install postgresql@17 && brew services start postgresql@17`).

```bash
npm install
cp .env.example .env    # then fill in the secrets — see below
npm run db:migrate      # creates the database and applies the Prisma migrations
npm run cms:migrate     # creates the CMS tables
npm run cms:seed        # placeholder contact details and leadership positions
npm run dev
```

Before committing, run `npm run lint`, `npm test` and `npm run build`. The build reads published CMS content, so it needs the database running.

Connecting a Supabase project for staging or production is a separate checklist: [docs/supabase.md](docs/supabase.md).

### Staff accounts

There is no self sign-up. Create accounts and choose which inboxes each person can open and which website editing roles they hold:

```bash
npm run staff:add -- --email ama@example.org --name "Ama Mensah" --inbox safeguarding --inbox support
npm run staff:add -- --email kofi@example.org --name "Kofi Boateng" --cms writer
```

The script prints a temporary password once. The person signs in at `/portal/sign-in` and must set up an authenticator app before they can see anything. Running it again replaces that person's access; `--reset` issues a new password and clears two-step verification. Both sign the person out everywhere.

Inboxes: `safeguarding`, `about_safeguarding_lead`, `about_executive`, `support`, `volunteer`, `enquiries`, `partnerships`, `fundraising`, `complaints`, `misconduct`, `recruitment`. Give `about_executive` only to the Board Chair, and `about_safeguarding_lead` only to the Executive Director and the Board Chair: they receive reports about those leaders.

Website roles (`--cms`), used at `/cms`:
- `writer` drafts content and marks it ready for review.
- `publisher` approves, asks for changes, and publishes.
- `safeguarding_reviewer` must approve anything marked as featuring a child. That approval covers the exact version they saw.

### Website editor (`/cms`)

Payload CMS manages news, events and publications, board and leadership profiles, vacancies, images and contact details. Staff sign in through the portal; the editor has no passwords of its own. Published changes reach the site within a minute.

- Images of an identifiable child need a consent record covering the website. Without one they can't be published, and they disappear from the site when consent expires.
- Uploads are re-encoded, which strips location data, and renamed randomly.
- Schema changes go through migrations: after changing a collection, run `npm run payload -- migrate:create <name>` and commit the file. Payload's CLI runs through `npm run payload`, because its default loader fails on Node 26.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Staging and production use EdBridge's Supabase project (London); see [docs/supabase.md](docs/supabase.md). |
| `DATABASE_CA_CERT` | Supabase's CA certificate, so the database connection's TLS certificate is verified. Not needed locally. |
| `PAYLOAD_SECRET` | Signs the CMS's internal tokens. `openssl rand -base64 32` |
| `BETTER_AUTH_SECRET` | Signs sessions and encrypts authenticator secrets. `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | The site's own URL, e.g. `http://localhost:3000`. |
| `INTAKE_ENCRYPTION_KEY` | AES-256-GCM key for stored form answers. `openssl rand -base64 32` |
| `SAFEGUARDING_ENCRYPTION_KEY` | Separate key for safeguarding concerns. Same format. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on the public forms. `.env.example` has Cloudflare's always-pass test keys for local use; staging and production need real keys. Without a secret, public forms refuse every submission. |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Supabase Storage for CMS images. Leave blank locally: images are stored in `./media`. |
| `RESEND_API_KEY`, `ALERT_EMAIL_FROM` | Optional. Staff alert emails; without a key, alerts are only logged. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata, the sitemap and alert links. Defaults to `https://edbridgeafrica.org`. |
| `NEXT_PUBLIC_PAYSTACK_DONATE_URL` | Paystack hosted payment page. If unset, the Donate page shows a "being set up" notice. |

**Back up the encryption keys in EdBridge's password manager.** Records encrypted with a lost key can't be recovered.

## Structure

```
src/
  app/(site)/     public pages — one folder per route; forms keep actions.ts + options.ts beside the page
  app/(portal)/   staff portal at /portal: sign-in, two-step setup, inboxes
  app/(payload)/  website editor at /cms and its API at /cms-api
  cms/            Payload collections, review workflow, access rules, cached queries for the public site
  components/     shared UI; form/ holds the accessible form system
  content/        page copy that isn't in the CMS yet (nav, programs, regions)
  server/         server-only logic: auth, staff sessions, intake, encryption, audit log, alerts
  lib/            code shared by client and server
prisma/           schema and migrations (schemas: app, intake, safeguarding, audit; Payload owns cms)
db/               one-time Supabase setup SQL (the restricted app role)
docs/             runbooks
scripts/          admin scripts (staff accounts, CMS seed)
tests/            unit tests (node:test)
```

## Current status (Phase 1A, in progress)

- All 20 required pages plus Apply for support, vacancy and news pages, 404 and error pages, the sitemap and robots.txt.
- **Website editor (Payload CMS)** with a writer → publisher review workflow, safeguarding approval for content featuring a child, image consent checks and version history.
- Forms (volunteer, contact, report a concern, apply for support, which also covers school referrals, and job applications with a CV) validate on the server with Zod and have an accessible error summary.
- **Conflict routing:** reports about the Executive Director or Deputy go only to the Board Chair; reports about the Safeguarding Lead go to the Executive Director and the Board Chair.
- **CVs** are checked by their actual content (PDF or .docx, under 4 MB), encrypted with the intake key, and downloadable only from the portal, with every download logged.
- **Security headers:** CSP, HSTS, frame blocking, nosniff, referrer and permissions policies. The CSP allows inline scripts because nonces would force every page to render per request instead of being served from the CDN.
- **Submissions are stored encrypted** (AES-256-GCM) and routed to an inbox by form and topic. Safeguarding concerns go to their own schema under their own key.
- **Spam protection on public forms:** a honeypot field, Cloudflare Turnstile (invisible unless Cloudflare needs a click), and a limit of 20 submissions per IP address per hour. The limit is deliberately generous because schools and mobile networks share addresses; IPs are stored only as keyed hashes and old counters are deleted.
- **Staff portal:** email + password with mandatory authenticator-app codes, 30-minute idle and 12-hour absolute session limits, sign-in lockout after 5 failures, and per-inbox access. Records a person can't open return "not found".
- **Audit log:** every submission, sign-in, record view and status change is written to an append-only, hash-chained table; a database trigger blocks edits and deletes.
- Placeholders in `[square brackets]` and "Draft for EdBridge to review" notices mark content EdBridge must supply or approve.
- Design tokens live in `src/app/globals.css`. Every colour pairing is contrast-checked for WCAG 2.2 AA, and Noto Sans and Merriweather were chosen because they cover Ghanaian-language letters.

Not built yet:
- an in-portal screen for managing staff, and self-service password reset (both need email set up first)
- the session-expiry warning
- passkeys
- the newsletter sign-up (needs EdBridge's Resend account)
- moving the remaining page copy and policies into the CMS
- off-site backups to Backblaze B2
