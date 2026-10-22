import Config from "react-native-config";
import { z } from "zod";

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  DEFAULT_STORE_ID: z.string().optional(),
});

const rawEnv = {
  API_BASE_URL:
    Config.API_BASE_URL || "https://blinkit-backend-2bv1.onrender.com/api",
  DEFAULT_STORE_ID: Config.DEFAULT_STORE_ID || "6ad8eebdfce460c6fde26605",
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(
      parsed.error.flatten().fieldErrors
    )}`
  );
}

export const env = Object.freeze(parsed.data);
