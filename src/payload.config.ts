import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Jobs } from "./cms/collections/jobs";
import { Media } from "./cms/collections/media";
import { News } from "./cms/collections/news";
import { People } from "./cms/collections/people";
import { Users } from "./cms/collections/users";
import { SiteSettings } from "./cms/globals/site-settings";
import { pgConfig } from "./server/pg-config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase Storage speaks the S3 protocol. Without a bucket configured, uploads stay on local disk.
const s3Bucket = process.env.S3_BUCKET;

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  routes: { admin: "/cms", api: "/cms-api" },
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " | EdBridge website editor", robots: "noindex, nofollow" },
    components: { logout: { Button: "/cms/components/back-to-portal#BackToPortal" } },
    importMap: { baseDir: dirname, importMapFile: path.resolve(dirname, "app/(payload)/cms/importMap.js") },
  },
  collections: [News, People, Jobs, Media, Users],
  globals: [SiteSettings],
  // Images go in the image field, where consent is checked, not inside the text.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => defaultFeatures.filter((feature) => !["upload", "relationship"].includes(feature.key)),
  }),
  db: postgresAdapter({
    pool: pgConfig(),
    schemaName: "cms",
    // Schema changes go through reviewed migrations in every environment, as Prisma's do.
    push: false,
    migrationDir: path.resolve(dirname, "cms/migrations"),
  }),
  graphQL: { disable: true },
  telemetry: false,
  sharp,
  typescript: { outputFile: path.resolve(dirname, "cms/payload-types.ts") },
  plugins: s3Bucket
    ? [
        s3Storage({
          collections: { media: true },
          bucket: s3Bucket,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
            },
          },
        }),
      ]
    : [],
});
