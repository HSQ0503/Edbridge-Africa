// A subset of pg's PoolConfig: Prisma and Payload each bring their own copy of the pg types.
type PgConnection = { connectionString?: string; ssl?: { ca?: string } };

// Shared by Prisma and Payload at runtime. Supabase signs its database certificates with its own CA, so verifying
// them needs that CA (DATABASE_CA_CERT). SSL parameters are removed from the URL because pg lets them override
// this config; the Prisma CLI still reads them from the same URL.
export function pgConfig(): PgConnection {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return {};
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("sslmode");
  for (const key of ["sslmode", "sslrootcert", "uselibpqcompat"]) url.searchParams.delete(key);

  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  // Without the CA, an SSL connection is verified against public CAs, which fails loudly for Supabase rather than
  // silently accepting any certificate.
  const ssl = ca ? { ca } : sslMode && sslMode !== "disable" ? {} : undefined;
  return { connectionString: url.toString(), ssl };
}
