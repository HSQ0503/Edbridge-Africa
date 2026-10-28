-- One-time setup for each Supabase project (staging and production), run in the SQL editor AFTER the first
-- `npm run db:deploy`. See docs/supabase.md.
--
-- The website connects as `edbridge_app`, not `postgres`. That role owns nothing, so it can't drop the audit
-- trigger, alter tables or bypass row-level security, and it can only insert into the audit log (PLAN.md §10).
-- Migrations keep running as `postgres`.

-- 1. Replace the placeholder with a long random password (openssl rand -base64 32) before running.
create role edbridge_app login password 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD' nobypassrls noinherit;

-- 2. Everyday read and write access to the application schemas.
grant usage on schema app, intake, safeguarding, audit, cms to edbridge_app;
grant select, insert, update, delete on all tables in schema app, intake, safeguarding, cms to edbridge_app;
grant usage, select on all sequences in schema app, intake, safeguarding, audit, cms to edbridge_app;

-- 3. The audit log is append-only for the app: read the last hash, insert the next event, nothing else.
grant select, insert on all tables in schema audit to edbridge_app;

-- 4. Tables that future migrations create get the same grants automatically.
alter default privileges for role postgres in schema app, intake, safeguarding, cms
  grant select, insert, update, delete on tables to edbridge_app;
alter default privileges for role postgres in schema audit
  grant select, insert on tables to edbridge_app;
alter default privileges for role postgres in schema app, intake, safeguarding, audit, cms
  grant usage, select on sequences to edbridge_app;

-- 5. Supabase's browser-facing roles get nothing. The website never queries from the browser, and the Data API
--    should also be switched off in the dashboard.
revoke all on schema app, intake, safeguarding, audit, cms from anon, authenticated;
revoke all on all tables in schema app, intake, safeguarding, audit, cms from anon, authenticated;
