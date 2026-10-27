# EdBridge Africa

Public website and staff portal for EdBridge Africa, a nonprofit working on education access and disability inclusion in Ghana. The full build plan is in [PLAN.md](PLAN.md).

## Getting started

You need Node 22+ and a local Postgres 17 (for example `brew install postgresql@17 && brew services start postgresql@17`).

```bash
npm install
cp .env.example .env    # then fill in the secrets — see below
npm run db:migrate      # creates the database and applies migrations
npm run dev
```

Before committing, run `npm run lint` and `npm run build`.

### Staff accounts

There is no self sign-up. Create accounts and choose which inboxes each person can open:

```bash
npm run staff:add -- --email ama@example.org --name "Ama Mensah" --inbox safeguarding --inbox support
```

The script prints a temporary password once. The person signs in at `/portal/sign-in` and must set up an authenticator app before they can see anything. Running it again with `--inbox` replaces that person's access; `--reset` issues a new password and clears two-step verification. Both sign the person out everywhere.

Inboxes: `safeguarding`, `support`, `volunteer`, `enquiries`, `partnerships`, `fundraising`, `complaints`, `misconduct`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Staging and production use EdBridge's Supabase project (London). |
| `BETTER_AUTH_SECRET` | Signs sessions and encrypts authenticator secrets. `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | The site's own URL, e.g. `http://localhost:3000`. |
| `INTAKE_ENCRYPTION_KEY` | AES-256-GCM key for stored form answers. `openssl rand -base64 32` |
| `SAFEGUARDING_ENCRYPTION_KEY` | Separate key for safeguarding concerns. Same format. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on the public forms. `.env.example` has Cloudflare's always-pass test keys for local use; staging and production need real keys. Without a secret, public forms refuse every submission. |
| `RESEND_API_KEY`, `ALERT_EMAIL_FROM` | Optional. Staff alert emails; without a key, alerts are only logged. |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata, the sitemap and alert links. Defaults to `https://edbridgeafrica.org`. |
| `NEXT_PUBLIC_PAYSTACK_DONATE_URL` | Paystack hosted payment page. If unset, the Donate page shows a "being set up" notice. |

**Back up the encryption keys in EdBridge's password manager.** Records encrypted with a lost key can't be recovered.

## Structure

```
src/
  app/(site)/     public pages — one folder per route; forms keep actions.ts + options.ts beside the page
  app/(portal)/   staff portal at /portal: sign-in, two-step setup, inboxes
  components/     shared UI; form/ holds the accessible form system
  content/        site copy and collections (nav, programs, leadership) — moves to Payload CMS later
  server/         server-only logic: auth, staff sessions, intake, encryption, audit log, alerts
  lib/            code shared by client and server
prisma/           schema and migrations (schemas: app, intake, safeguarding, audit)
scripts/          admin scripts (staff accounts)
```

## Current status (Phase 1A, in progress)

- All 20 required pages plus Apply for support, a 404 page, the sitemap and robots.txt.
- Forms (volunteer, contact, report a concern, apply for support) validate on the server with Zod and have an accessible error summary.
- **Submissions are stored encrypted** (AES-256-GCM) and routed to an inbox by form and topic. Safeguarding concerns go to their own schema under their own key.
- **Spam protection on public forms:** a honeypot field, Cloudflare Turnstile (invisible unless Cloudflare needs a click), and a limit of 20 submissions per IP address per hour. The limit is deliberately generous because schools and mobile networks share addresses; IPs are stored only as keyed hashes and old counters are deleted.
- **Staff portal:** email + password with mandatory authenticator-app codes, 30-minute idle and 12-hour absolute session limits, sign-in lockout after 5 failures, and per-inbox access. Records a person can't open return "not found".
- **Audit log:** every submission, sign-in, record view and status change is written to an append-only, hash-chained table; a database trigger blocks edits and deletes.
- Placeholders in `[square brackets]` and "Draft for EdBridge to review" notices mark content EdBridge must supply or approve.
- Design tokens live in `src/app/globals.css`. Every colour pairing is contrast-checked for WCAG 2.2 AA, and Noto Sans and Merriweather were chosen because they cover Ghanaian-language letters.

Not built yet: conflict routing for reports about senior staff or the Safeguarding Lead, an in-portal screen for managing staff and changing passwords, the session-expiry warning, passkeys, Payload CMS, and the remaining forms (job application, school referral, newsletter). When security headers are added, the Content Security Policy must allow `challenges.cloudflare.com` for scripts and frames.
