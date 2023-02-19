import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(4000),
});

const tmp_env = envSchema.safeParse(process.env);

if (tmp_env.success === false) {
  console.error("Invalid enviroment variables!", tmp_env.error.format());

  throw new Error("Invalid enviroment variables");
}

export const env = tmp_env.data;
