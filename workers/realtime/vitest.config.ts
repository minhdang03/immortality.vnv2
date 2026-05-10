import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use @cloudflare/vitest-pool-workers for Workers runtime emulation (Miniflare)
    pool: "@cloudflare/vitest-pool-workers",
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          // Emulate Durable Objects locally
          durableObjects: {
            CHANNEL: "ChannelDurableObject",
          },
          kvNamespaces: ["KV_JWKS", "KV_CACHE"],
          bindings: {
            FIREBASE_PROJECT_ID: "test-project",
            FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
              project_id: "test-project",
              private_key_id: "test-key-id",
              private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7o4qne60TB3wo\n-----END PRIVATE KEY-----\n",
              client_email: "test@test-project.iam.gserviceaccount.com",
            }),
            ENV: "development",
            CORS_ORIGINS: "http://localhost:8081",
          },
        },
      },
    },
    include: ["test/**/*.test.ts"],
  },
});
