/**
 * useAiStreamSseTurnBased — SSE streaming hook for AI hỏi ngược (Phone 4).
 *
 * Design decisions:
 *   - TURN-BASED: waits for complete AI response before surfacing to UI (no partial streaming shown)
 *   - Uses fetch + ReadableStream body reader (no extra library dependency)
 *   - Parses SSE chunks: `data: {"delta":"..."}\n\n` — accumulates into full message
 *   - On SSE `data: [DONE]` → marks message complete and appends to messages array
 *   - Abort support: AbortController on each turn, cleaned up on unmount
 *
 * Backend endpoint: POST /api/ai/ask (Phase 4 — workers/notion/src/ai-ask-sse-handler.ts)
 * Request body: { messages: [{role, content}], sessionId? }
 * SSE format: `data: {"delta":"..."}\n\n` | `data: [DONE]\n\n` | `data: {"error":"..."}\n\n`
 *
 * Feature flag: process.env.EXPO_PUBLIC_USE_STORE_KIT_IAP does NOT affect this hook.
 */
import { useState, useCallback, useRef } from 'react';
import { getIdToken } from '../services/firebase-auth-service';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.battudao.com';

export type AiRole = 'user' | 'ai';

export interface AiChatMessage {
  id: string;
  role: AiRole;
  content: string;
  isComplete: boolean;  // false only during active streaming (internal — not exposed in UI)
}

export interface UseAiStreamReturn {
  messages: AiChatMessage[];
  isStreaming: boolean;
  error: string | null;
  send: (userText: string) => Promise<void>;
  reset: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAiStreamSseTurnBased(): UseAiStreamReturn {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (userText: string) => {
    if (isStreaming) return;

    const userMessage: AiChatMessage = {
      id: generateId(),
      role: 'user',
      content: userText.trim(),
      isComplete: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setError(null);

    // Build conversation history for the backend
    const historyForBackend = [...messages, userMessage].map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = await getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: historyForBackend }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`AI endpoint error: ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Response body is null — SSE not supported');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines — split on double newlines (SSE event boundary)
        const parts = buffer.split('\n\n');
        // Last part may be incomplete — keep it in buffer
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;

          const dataStr = line.slice('data:'.length).trim();

          if (dataStr === '[DONE]') {
            // Stream complete — append full message to state
            const aiMessage: AiChatMessage = {
              id: generateId(),
              role: 'ai',
              content: accumulated,
              isComplete: true,
            };
            setMessages((prev) => [...prev, aiMessage]);
            accumulated = '';
            break;
          }

          let parsed: { delta?: string; error?: string } | null = null;
          try {
            parsed = JSON.parse(dataStr) as { delta?: string; error?: string };
          } catch {
            // Malformed JSON chunk — skip silently (streaming resilience)
            continue;
          }
          // Rethrow server-sent error OUTSIDE the JSON parse catch so it
          // propagates to the outer try/catch and surfaces via setError().
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.delta) {
            accumulated += parsed.delta;
            // Intentionally NOT updating state during streaming — turn-based design.
            // UI only sees the completed message on [DONE].
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User-initiated abort — not an error
        return;
      }
      const message = err instanceof Error ? err.message : 'AI request failed';
      setError(message);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [isStreaming, messages]);

  const reset = useCallback(() => {
    // Abort in-flight request if any
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsStreaming(false);
    setError(null);
  }, []);

  return { messages, isStreaming, error, send, reset };
}
