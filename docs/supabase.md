# Connecting Supabase

Do this once for **staging** and once for **production**, each in its own Supabase project. Staging only ever holds made-up data (PLAN.md §3.3). Real children's data goes into production only after the legal go-live gate (PLAN.md §18).

EdBridge creates the Supabase organisation under its own address and invites the developer as a *Developer* (PLAN.md §16.1). Store every password and key below in EdBridge's password manager.

## 1. Create the project

- Region: **London (eu-west-2)**. The Vercel functions run in London too (`vercel.json`).
- Plan: Pro, for daily backups and no pausing.
- Generate a long database password and save it.

## 2. Lock down the defaults

- **Settings → Data API:** turn the Data API off. The site never queries Supabase from the browser.
- **Database → Settings → SSL:** turn on *Enforce SSL* and download the CA certificate. Its contents go in `DATABASE_CA_CERT`.
- Limit dashboard access to two named EdBridge people, both with MFA.

## 3. Run the setup script

```bash
npm run supabase:setup -- --ca prod-ca-2021.crt --site-url https://<this environment's address>
```

It asks for the **session pooler** connection string (port 5432, from the *Connect* button, with the database password filled in) without showing it on screen. The direct connection only works over IPv6. Then it:

- Applies the Prisma migrations (`app`, `intake`, `safeguarding`, `audit`), then the Payload migrations (`cms`), then seeds the placeholder contact details and leadership positions (`npm run db:deploy`).
- Runs `db/supabase-setup.sql` with a random password, creating `edbridge_app`, the role the website connects as. It can't change tables, drop the audit triggers, or edit or delete audit entries.
- Writes `.env.vercel` (gitignored, readable only by you) with the variables for step 6: `DATABASE_URL` for the transaction pooler as `edbridge_app`, the CA certificate, and newly generated secrets and encryption keys.
- Signs in as `edbridge_app` to check it works.

To do the same by hand: run `npm run db:deploy` with `DATABASE_URL`, `DATABASE_CA_CERT` and `PAYLOAD_SECRET` exported, then run `db/supabase-setup.sql` in the SQL editor after replacing its placeholder with `openssl rand -hex 32` (base64 characters like `/` break the connection URL).

## 4. Save the encryption keys

Copy `INTAKE_ENCRYPTION_KEY` and `SAFEGUARDING_ENCRYPTION_KEY` from `.env.vercel` into EdBridge's password manager before anything else. Records encrypted with a lost key can't be recovered.

## 5. Image storage

- **Storage:** create a **private** bucket called `media`.
- **Storage → Settings → S3 connection:** enable it and create an access key.
- These fill `S3_BUCKET`, `S3_ENDPOINT` (`https://<project-ref>.storage.supabase.co/storage/v1/s3`), `S3_REGION` (`eu-west-2`), `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`.

Images are served through the CMS, which checks consent before returning an image of an identifiable child. The bucket itself stays private.

## 6. Vercel environment variables

Set these separately for Preview (staging) and Production. Generate new secrets for each environment and never reuse local ones.

Paste `.env.vercel` into Vercel's environment variable form (it covers everything down to `NEXT_PUBLIC_SITE_URL`), add the rest, then delete the file.

| Variable | Value |
|---|---|
| `DATABASE_URL` | **Transaction pooler** (port 6543) as `edbridge_app`: `postgresql://edbridge_app.<project-ref>:<app-password>@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require` |
| `DATABASE_CA_CERT` | Contents of the CA certificate from step 2 |
| `BETTER_AUTH_SECRET`, `PAYLOAD_SECRET` | `openssl rand -base64 32` each |
| `INTAKE_ENCRYPTION_KEY`, `SAFEGUARDING_ENCRYPTION_KEY` | `openssl rand -base64 32` each. **Back them up first:** records encrypted with a lost key can't be recovered. |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL` | The environment's own URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Real keys from EdBridge's Cloudflare account |
| `S3_*` | From step 5 |
| `RESEND_API_KEY`, `ALERT_EMAIL_FROM` | From EdBridge's Resend account, once the domain is verified |
| `NEXT_PUBLIC_PAYSTACK_DONATE_URL` | The Paystack payment page, once KYC is approved |

The build reads published CMS content, so the build needs `DATABASE_URL` too (Vercel applies the same variables to builds).

## 7. First accounts

Make the first staff admin from the command line, with `DATABASE_URL` pointing at the environment (`edbridge_app` is enough; `vercel env pull .env.production.local --environment production` fetches it):

```bash
npx tsx --env-file=.env.production.local scripts/add-staff.ts --email it@edbridgeafrica.org --name "…" --admin
```

Then sign in and add everyone else at `/portal/staff`: each person gets an email with a link to choose their password. Each person signs in at `/portal/sign-in` with a code emailed to them, so `RESEND_API_KEY` must be set first. Give the conflict inboxes (`about_executive`, `about_safeguarding_lead`) only to the people named in their descriptions, and never to the person the reports are about.

## 8. Check it works

- `curl -I https://<site>/` shows the CSP, HSTS and other security headers.
- Submit each public form, then open it in the portal. Confirm the alert email contains no details.
- In `/cms`, a writer submits a news item, a publisher approves and publishes it, and it appears on `/news` within a minute.
- Sign in from a private window and leave it idle for 30 minutes: the session expires.

## Later migrations

Apply new migrations **before** deploying the code that needs them, as `postgres` through the session pooler (the restricted app role can't change tables):

```bash
npm run supabase:setup -- --migrate --ca prod-ca-2021.crt
```

New tables get `edbridge_app` grants automatically through the default privileges in `db/supabase-setup.sql`.

## Not set up yet

- Nightly encrypted off-site backups to Backblaze B2 (PLAN.md §10). Supabase's own daily backups cover the database in the meantime, but not stored images.
- The quarterly restore drill.
