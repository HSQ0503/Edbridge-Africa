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

## 3. Create the tables

Use the **session pooler** connection string (port 5432) as `postgres`. The direct connection only works over IPv6.

```bash
export DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
export DATABASE_CA_CERT="$(cat prod-ca-2021.crt)"
export PAYLOAD_SECRET="<this environment's Payload secret>"
npm run db:deploy
```

This applies the Prisma migrations (`app`, `intake`, `safeguarding`, `audit`), then the Payload migrations (`cms`), then seeds the placeholder contact details and leadership positions.

## 4. Create the restricted app role

Open `db/supabase-setup.sql`, replace the placeholder password with a new random one (`openssl rand -base64 32`), and run it in the SQL editor. The website connects as `edbridge_app`. That role can't change tables, drop the audit triggers, or edit or delete audit entries.

## 5. Image storage

- **Storage:** create a **private** bucket called `media`.
- **Storage → Settings → S3 connection:** enable it and create an access key.
- These fill `S3_BUCKET`, `S3_ENDPOINT` (`https://<project-ref>.storage.supabase.co/storage/v1/s3`), `S3_REGION` (`eu-west-2`), `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`.

Images are served through the CMS, which checks consent before returning an image of an identifiable child. The bucket itself stays private.

## 6. Vercel environment variables

Set these separately for Preview (staging) and Production. Generate new secrets for each environment and never reuse local ones.

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

With `DATABASE_URL` pointing at the environment (`edbridge_app` is enough):

```bash
npm run staff:add -- --email lead@edbridgeafrica.org --name "…" --inbox safeguarding
npm run staff:add -- --email comms@edbridgeafrica.org --name "…" --cms publisher
```

Each person signs in at `/portal/sign-in` and sets up an authenticator app before anything else. Give the conflict inboxes (`about_executive`, `about_safeguarding_lead`) only to the people named in their descriptions, and never to the person the reports are about.

## 8. Check it works

- `curl -I https://<site>/` shows the CSP, HSTS and other security headers.
- Submit each public form, then open it in the portal. Confirm the alert email contains no details.
- In `/cms`, a writer submits a news item, a publisher approves and publishes it, and it appears on `/news` within a minute.
- Sign in from a private window and leave it idle for 30 minutes: the session expires.

## Later migrations

Run `npm run db:deploy` against the session pooler as `postgres` **before** deploying code that needs the new schema. New tables get `edbridge_app` grants automatically through the default privileges from step 4.

## Not set up yet

- Nightly encrypted off-site backups to Backblaze B2 (PLAN.md §10). Supabase's own daily backups cover the database in the meantime, but not stored images.
- The quarterly restore drill.
