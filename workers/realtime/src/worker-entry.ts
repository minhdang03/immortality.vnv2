/**
 * Cloudflare Worker entry point for btd-realtime.
 *
 * Routes:
 *   GET /ws/channels/:channelId  — WebSocket upgrade → ChannelDurableObject
 *   GET /health                  — simple health check (no auth)
 *
 * All other paths return 404.
 *
 * Auth is enforced inside the DO before WS upgrade is accepted.
 * This Worker only validates the path and forwards the upgrade.
 */

import { ChannelDurableObject } from "./channel-durable-object.ts";
import type { Env } from "./worker-env.d.ts";

export { ChannelDurableObject };

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check — used by uptime monitors, no auth needed
    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "btd-realtime" });
    }

    // WebSocket upgrade route: /ws/channels/:channelId
    const wsMatch = url.pathname.match(/^\/ws\/channels\/([^/]+)$/);
    if (wsMatch) {
      const channelId = wsMatch[1];
      if (!channelId || channelId.length > 128) {
        return new Response("Invalid channel ID", { status: 400 });
      }

      // Route to the per-channel Durable Object instance
      const id = env.CHANNEL.idFromName(channelId);
      const stub = env.CHANNEL.get(id);
      return stub.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

export default worker;
