// One-time setup of a Supabase project (docs/supabase.md steps 3, 4 and 6). It runs the migrations and the seed,
// creates the restricted edbridge_app role, and writes every secret Vercel needs to a gitignored file, so no
// password is ever typed into a dashboard or shown on screen.
//
//   npm run supabase:setup -- --ca prod-ca-2021.crt --site-url https://edbridge.vercel.app
//
// Later schema changes only need the migrations, which the restricted app role can't run:
//
//   npm run supabase:setup -- --migrate --ca prod-ca-2021.crt
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import pg from "pg";
import { pgConfig } from "../src/server/pg-config";

const { values: args } = parseArgs({
  options: {
    ca: { type: "string" },
    "site-url": { type: "string" },
    out: { type: "string", default: ".env.vercel" },
    migrate: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    let answer = "";
    process.stdin.on("data", (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") process.exit(130);
        if (char === "\r" || char === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          return resolve(answer.trim());
        }
        answer = char === "\u007f" ? answer.slice(0, -1) : answer + char;
      }
    });
  });
}

// Supabase's pooler expects "<role>.<project-ref>" as the user name. The website uses the transaction pooler
// (port 6543), which suits short-lived serverless connections.
function appUrlFor(sessionUrl: URL, appPassword: string) {
  const appUrl = new URL(sessionUrl);
  const projectRef = sessionUrl.username.split(".")[1];
  appUrl.username = projectRef ? `edbridge_app.${projectRef}` : "edbridge_app";
  appUrl.password = appPassword;
  if (sessionUrl.hostname.endsWith(".pooler.supabase.com")) appUrl.port = "6543";
  return appUrl;
}

async function withClient<T>(databaseUrl: string, run: (client: pg.Client) => Promise<T>) {
  process.env.DATABASE_URL = databaseUrl;
  const client = new pg.Client(pgConfig());
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

const siteUrl = args["site-url"]?.replace(/\/$/, "");
if (!args.migrate && !siteUrl?.startsWith("https://") && !siteUrl?.startsWith("http://localhost")) {
  fail("Pass the deployment's address with --site-url, for example --site-url https://edbridge.vercel.app");
}
// Refusing to overwrite protects encryption keys that may already be in use.
if (!args.migrate && existsSync(args.out)) fail(`${args.out} already exists. Move it somewhere safe or delete it first.`);
if (args.ca && !existsSync(args.ca)) fail(`Can't find ${args.ca}. Move the certificate into this folder or pass its full path.`);
const caCert = args.ca ? readFileSync(args.ca, "utf8") : "";

const sessionInput =
  process.env.SUPABASE_DB_URL ??
  (await askHidden("Paste the session pooler connection string (port 5432), with the password filled in: "));
const sessionUrl = URL.canParse(sessionInput) ? new URL(sessionInput) : fail("That isn't a connection string.");
if (!["postgres:", "postgresql:"].includes(sessionUrl.protocol)) {
  fail("That isn't a connection string. Paste only the string, starting with postgresql://");
}
if (sessionUrl.password.startsWith("%5B") && sessionUrl.password.endsWith("%5D")) {
  fail("Remove the square brackets around the password: [YOUR-PASSWORD] becomes just the password.");
}
if (sessionUrl.hostname.endsWith(".supabase.co")) {
  fail("That's the direct connection, which only works over IPv6. Use the session pooler string (port 5432).");
}
if (sessionUrl.hostname.endsWith(".pooler.supabase.com")) {
  // PLAN.md keeps the data in London, next to the Vercel functions. A project's region can't be changed later.
  if (!sessionUrl.hostname.includes("eu-west-2")) {
    fail(`This project's host is ${sessionUrl.hostname}, not London (eu-west-2). Create a new Supabase project in London and use its string.`);
  }
  if (sessionUrl.port !== "5432") fail("Use the session pooler (port 5432). The transaction pooler can't run migrations.");
  if (!caCert) fail("Pass Supabase's CA certificate with --ca (Database → Settings → SSL → Download certificate).");
  if (!sessionUrl.searchParams.has("sslmode")) sessionUrl.searchParams.set("sslmode", "require");
}

const secret = () => randomBytes(32).toString("base64");
const payloadSecret = secret();
// Hex, because base64 characters like "/" would break the connection URL.
const appPassword = randomBytes(32).toString("hex");

console.log("\n1/3 Running migrations and the CMS seed…");
const deploy = spawnSync("npm", ["run", "db:deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: sessionUrl.toString(), DATABASE_CA_CERT: caCert, PAYLOAD_SECRET: payloadSecret },
});
if (deploy.status !== 0) fail("Migrations failed. Nothing else was changed.");
if (args.migrate) {
  console.log("\nThe database is up to date. Deploy the code that needs it now.");
  process.exit(0);
}

console.log("\n2/3 Creating the edbridge_app role…");
process.env.DATABASE_CA_CERT = caCert;
await withClient(sessionUrl.toString(), async (client) => {
  const { rowCount } = await client.query("select 1 from pg_roles where rolname = 'edbridge_app'");
  const setupSql = readFileSync("db/supabase-setup.sql", "utf8")
    .replace("REPLACE_WITH_A_LONG_RANDOM_PASSWORD", appPassword)
    // Running again resets the password instead of failing.
    .replace("create role edbridge_app", rowCount ? "alter role edbridge_app" : "create role edbridge_app");
  await client.query(setupSql);
});

const appUrl = appUrlFor(sessionUrl, appPassword);
const variables = {
  DATABASE_URL: appUrl.toString(),
  // One line: Vercel and pg-config.ts both accept "\n" in place of line breaks.
  DATABASE_CA_CERT: caCert.trim().replace(/\r?\n/g, "\\n"),
  PAYLOAD_SECRET: payloadSecret,
  BETTER_AUTH_SECRET: secret(),
  BETTER_AUTH_URL: siteUrl,
  NEXT_PUBLIC_SITE_URL: siteUrl,
  INTAKE_ENCRYPTION_KEY: secret(),
  SAFEGUARDING_ENCRYPTION_KEY: secret(),
};
const envFile = Object.entries(variables)
  .filter(([, value]) => value)
  .map(([name, value]) => `${name}="${value}"`)
  .join("\n");
writeFileSync(args.out, `${envFile}\n`, { mode: 0o600 });

console.log("\n3/3 Checking the website can sign in as edbridge_app…");
try {
  await withClient(appUrl.toString(), async (client) => {
    const { rows } = await client.query(
      "select (select count(*) from cms.people)::int as people, has_table_privilege('audit.event', 'delete') as can_delete_audit",
    );
    if (rows[0].can_delete_audit) fail("edbridge_app can delete audit events. Check db/supabase-setup.sql ran in full.");
    console.log(`Connected. It can read the CMS (${rows[0].people} leadership positions) and can't delete audit events.`);
  });
} catch (error) {
  console.error(`The check failed: ${error instanceof Error ? error.message : error}`);
  console.error("The database is set up and the file is written; run the check again in a minute from the runbook.");
}

console.log(`\nWrote ${Object.keys(variables).filter((name) => variables[name as keyof typeof variables]).join(", ")} to ${args.out}.`);
console.log("Next: save INTAKE_ENCRYPTION_KEY and SAFEGUARDING_ENCRYPTION_KEY in a password manager, paste the file into");
console.log(`Vercel → Settings → Environment Variables, redeploy, then delete ${args.out}.`);
process.exit(0);
