/**
 * Tests: useAiStreamSseTurnBased
 *
 * Critical invariants:
 *   1. Parses SSE chunks `data: {"delta":"..."}` correctly
 *   2. Accumulates delta into full message before surfacing (turn-based)
 *   3. Messages array only updated on `data: [DONE]` — not during streaming
 *   4. Error chunk `data: {"error":"..."}` surfaces as error state
 *   5. reset() clears all state
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';

// ── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../../src/services/firebase-auth-service', () => ({
  getIdToken: jest.fn().mockResolvedValue('mock-token'),
}));

// Build a fake SSE ReadableStream from an array of raw SSE text chunks
function buildSseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let idx = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]));
      } else {
        controller.close();
      }
    },
  });
}

function mockFetch(chunks: string[], status = 200) {
  const stream = buildSseStream(chunks);
  (globalThis as unknown as Record<string, unknown>).fetch = jest.fn().mockResolvedValue({
    ok: status === 200,
    status,
    body: stream,
  } as unknown as Response);
}

// ── Import after mocks ────────────────────────────────────────────────────

import { useAiStreamSseTurnBased } from '../../src/hooks/use-ai-stream-sse-turn-based';

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useAiStreamSseTurnBased', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with empty messages and not streaming', () => {
    const { result } = renderHook(() => useAiStreamSseTurnBased());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('appends user message immediately on send', async () => {
    // Stream that never resolves — we just check user message appended
    mockFetch(['data: {"delta":"Hello"}\n\ndata: [DONE]\n\n']);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => {
      result.current.send('What is my deepest fear?');
    });

    await waitFor(() => !result.current.isStreaming);

    const userMsg = result.current.messages.find((m) => m.role === 'user');
    expect(userMsg).toBeDefined();
    expect(userMsg?.content).toBe('What is my deepest fear?');
  });

  it('accumulates SSE deltas into complete AI message on [DONE]', async () => {
    // Three delta chunks then [DONE] — simulates real SSE chunking
    mockFetch([
      'data: {"delta":"Câu "}\n\n',
      'data: {"delta":"hỏi "}\n\n',
      'data: {"delta":"ngược."}\n\ndata: [DONE]\n\n',
    ]);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => {
      result.current.send('Test prompt');
    });

    await waitFor(() => !result.current.isStreaming);

    const aiMsg = result.current.messages.find((m) => m.role === 'ai');
    expect(aiMsg).toBeDefined();
    // Accumulated text = all deltas joined
    expect(aiMsg?.content).toBe('Câu hỏi ngược.');
    expect(aiMsg?.isComplete).toBe(true);
  });

  it('does NOT update messages array with partial content during streaming (turn-based)', async () => {
    // Slow stream: track snapshots during streaming
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(c) { controller = c; },
    });

    (globalThis as unknown as Record<string, unknown>).fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: stream,
    } as unknown as Response);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    // Start send (don't await — we want to inspect mid-stream)
    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.send('Hello');
    });

    // Push first delta — should NOT appear as AI message yet
    act(() => {
      controller!.enqueue(encoder.encode('data: {"delta":"partial text"}\n\n'));
    });

    // At this point only user message should exist (no AI message yet)
    const aiMsgsDuringStream = result.current.messages.filter((m) => m.role === 'ai');
    expect(aiMsgsDuringStream).toHaveLength(0);

    // Complete the stream
    act(() => {
      controller!.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller!.close();
    });

    await act(async () => { await sendPromise!; });
    await waitFor(() => !result.current.isStreaming);

    // Now AI message should appear
    expect(result.current.messages.filter((m) => m.role === 'ai')).toHaveLength(1);
  });

  it('surfaces error when SSE contains error field', async () => {
    mockFetch(['data: {"error":"Rate limit exceeded"}\n\n']);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => {
      result.current.send('Prompt');
    });

    await waitFor(() => !result.current.isStreaming);

    expect(result.current.error).toBe('Rate limit exceeded');
  });

  it('surfaces error on non-200 response', async () => {
    mockFetch([], 500);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => {
      result.current.send('Prompt');
    });

    await waitFor(() => !result.current.isStreaming);

    expect(result.current.error).toContain('500');
  });

  it('reset() clears messages and error', async () => {
    mockFetch(['data: {"delta":"Hi"}\n\ndata: [DONE]\n\n']);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => { result.current.send('Prompt'); });
    await waitFor(() => !result.current.isStreaming);

    expect(result.current.messages.length).toBeGreaterThan(0);

    act(() => { result.current.reset(); });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isStreaming).toBe(false);
  });

  it('ignores malformed SSE chunks without throwing', async () => {
    // Malformed JSON chunk in the middle
    mockFetch([
      'data: {"delta":"Good"}\n\n',
      'data: NOT_JSON\n\n',
      'data: {"delta":" part"}\n\ndata: [DONE]\n\n',
    ]);

    const { result } = renderHook(() => useAiStreamSseTurnBased());

    await act(async () => { result.current.send('Prompt'); });
    await waitFor(() => !result.current.isStreaming);

    const aiMsg = result.current.messages.find((m) => m.role === 'ai');
    // Malformed chunk silently skipped — only good deltas accumulated
    expect(aiMsg?.content).toBe('Good part');
    expect(result.current.error).toBeNull();
  });
});
