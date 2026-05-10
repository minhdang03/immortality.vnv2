import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use standard Node environment for unit tests (not miniflare)
    // Miniflare integration tests would need @cloudflare/vitest-pool-workers
    // but for unit tests with mocked KV/env, Node env is sufficient
    environment: "node",
    globals: false,
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
    },
  },
  resolve: {
    // Allow .ts imports without extension in test files
    extensions: [".ts", ".js"],
  },
});
