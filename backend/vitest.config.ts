import { defineConfig } from "vitest/config";
import { configDotenv } from "dotenv";

const { parsed: testEnv } = configDotenv({ path: ".env.test" });

export default defineConfig({
  test: {
    env: testEnv ?? {},
  },
});
