# EdBridge Africa

Public website (and, from Phase 1B, the staff portal) for EdBridge Africa, a nonprofit working on education access and disability inclusion in Ghana. The full build plan is in [PLAN.md](PLAN.md).

## Getting started

```bash
npm install
npm run dev
```

Before committing, run `npm run lint` and `npm run build`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata and the sitemap. Defaults to `https://edbridgeafrica.org`. |
| `NEXT_PUBLIC_PAYSTACK_DONATE_URL` | Paystack hosted payment page. If unset, the Donate page shows a "being set up" notice. |

## Structure

```
src/
  app/(site)/     public pages — one folder per route; forms keep actions.ts + options.ts beside the page
  components/     shared UI; form/ holds the accessible form system
  content/        site copy and collections (nav, programs, leadership) — moves to Payload CMS later
  server/         server-only logic (form handling, intake)
  lib/            code shared by client and server
```

## Current status (Phase 1A, in progress)

- All 20 required pages plus Apply for support, a 404 page, the sitemap and robots.txt.
- Forms (volunteer, contact, report a concern, apply for support) validate on the server with Zod and have an accessible error summary.
- **Submissions are not stored yet.** In development they are validated and logged by field name only. In production they are refused until the intake database exists (`src/server/intake.ts`).
- Placeholders in `[square brackets]` and "Draft for EdBridge to review" notices mark content EdBridge must supply or approve.
- Design tokens live in `src/app/globals.css`. Every colour pairing is contrast-checked for WCAG 2.2 AA, and Noto Sans and Merriweather were chosen because they cover Ghanaian-language letters.
