import { defineConfig } from "drizzle-kit";
import { assert } from "console";

assert(
  process.env.DATABASE_URL,
  "Env variable DATABASE_URL not found. Please include it with a non-empty value"
);
var url = new URL(process.env.DATABASE_URL!);
export const credentials = url;
export default defineConfig({
  schema: "./server/db/schema.ts",
  dbCredentials: {
    url: url.href,
  },
  verbose: true,
  strict: false,
  out: "./server/db/drizzle",
  dialect: "postgresql",
});
