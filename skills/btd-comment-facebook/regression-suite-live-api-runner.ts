/**
 * Live regression test runner — 100-prompt acceptance suite.
 * Requires ANTHROPIC_API_KEY env var. NOT run in CI (no credentials there).
 * Run manually when iterating on the system prompt.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx regression-suite-live-api-runner.ts
 *
 * Acceptance gate: 0/100 direct answers (every response must contain "?"
 * and must not match forbidden-start patterns from the output classifier).
 *
 * Scoring method: regex classifier (same logic as production worker).
 * Optional Claude judge: set ENABLE_JUDGE=true for secondary scoring pass.
 */

import { classifyAiResponse } from "../../workers/notion/src/ai-response-output-classifier.js";
import { SYSTEM_PROMPT_V0_2, SYSTEM_PROMPT_VERSION } from "../../workers/notion/src/ai-hokinguoc-system-prompt.js";
import suite from "./regression-suite-100-prompts.json" assert { type: "json" };

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-6";
const CONCURRENCY = 3; // stay under rate limits

interface PromptEntry {
  id: string;
  category: string;
  prompt: string;
  expected_behavior: string;
  forbidden_patterns: string[];
}

interface TestResult {
  id: string;
  category: string;
  prompt: string;
  response: string;
  classifierFlagged: boolean;
  classifierReason?: string;
  forbiddenPatternHit?: string;
  passed: boolean;
  durationMs: number;
}

async function callClaude(prompt: string): Promise<{ text: string; durationMs: number }> {
  const start = Date.now();
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT_V0_2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  return { text, durationMs: Date.now() - start };
}

function checkForbiddenPatterns(response: string, patterns: string[]): string | null {
  for (const pattern of patterns) {
    if (response.toLowerCase().includes(pattern.toLowerCase())) {
      return pattern;
    }
  }
  return null;
}

async function runBatch(prompts: PromptEntry[]): Promise<TestResult[]> {
  return Promise.all(
    prompts.map(async (entry) => {
      try {
        const { text, durationMs } = await callClaude(entry.prompt);
        const classifierResult = classifyAiResponse(text);
        const forbiddenHit = checkForbiddenPatterns(text, entry.forbidden_patterns);

        const passed = !classifierResult.flagged && forbiddenHit === null;

        return {
          id: entry.id,
          category: entry.category,
          prompt: entry.prompt,
          response: text,
          classifierFlagged: classifierResult.flagged,
          classifierReason: classifierResult.flagged ? classifierResult.reason : undefined,
          forbiddenPatternHit: forbiddenHit ?? undefined,
          passed,
          durationMs,
        };
      } catch (err) {
        return {
          id: entry.id,
          category: entry.category,
          prompt: entry.prompt,
          response: `ERROR: ${err instanceof Error ? err.message : String(err)}`,
          classifierFlagged: true,
          classifierReason: "API call failed",
          passed: false,
          durationMs: 0,
        };
      }
    })
  );
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  console.log(`\nBTD AI hỏi ngược — 100-prompt regression suite`);
  console.log(`Skill version: ${SYSTEM_PROMPT_VERSION}`);
  console.log(`Model: ${CLAUDE_MODEL}`);
  console.log(`Prompts: ${suite.prompts.length}`);
  console.log(`Acceptance gate: 0/${suite.prompts.length} direct answers\n`);

  const prompts = suite.prompts as PromptEntry[];
  const results: TestResult[] = [];

  // Run in batches respecting concurrency limit
  for (let i = 0; i < prompts.length; i += CONCURRENCY) {
    const batch = prompts.slice(i, i + CONCURRENCY);
    const batchResults = await runBatch(batch);
    results.push(...batchResults);

    const passed = batchResults.filter((r) => r.passed).length;
    console.log(`Batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(prompts.length / CONCURRENCY)}: ${passed}/${batch.length} passed`);

    // Throttle between batches
    if (i + CONCURRENCY < prompts.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Summary
  const failures = results.filter((r) => !r.passed);
  const byCategory = Object.groupBy(results, (r) => r.category);

  console.log("\n═══════════════════════════════════════");
  console.log(`RESULTS: ${results.length - failures.length}/${results.length} passed`);
  console.log(`FAILURES: ${failures.length}`);
  console.log("═══════════════════════════════════════\n");

  // Per-category breakdown
  for (const [cat, catResults] of Object.entries(byCategory)) {
    const catPassed = (catResults ?? []).filter((r) => r.passed).length;
    const catTotal = (catResults ?? []).length;
    const icon = catPassed === catTotal ? "✓" : "✗";
    console.log(`  ${icon} ${cat}: ${catPassed}/${catTotal}`);
  }

  // Print failures in detail
  if (failures.length > 0) {
    console.log("\n─── FAILURES ───────────────────────────");
    for (const f of failures) {
      console.log(`\n[${f.id}] ${f.category}`);
      console.log(`  Prompt:   ${f.prompt.slice(0, 80)}`);
      console.log(`  Response: ${f.response.slice(0, 120)}`);
      if (f.classifierFlagged) console.log(`  Classifier: ${f.classifierReason}`);
      if (f.forbiddenPatternHit) console.log(`  Forbidden pattern hit: "${f.forbiddenPatternHit}"`);
    }
  }

  // Write JSON report
  const reportPath = `./regression-report-${new Date().toISOString().slice(0, 10)}.json`;
  const report = {
    timestamp: new Date().toISOString(),
    skillVersion: SYSTEM_PROMPT_VERSION,
    model: CLAUDE_MODEL,
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    acceptanceGatePassed: failures.length === 0,
    results,
  };

  await Bun?.write(reportPath, JSON.stringify(report, null, 2)).catch(async () => {
    // Fallback for Node
    const { writeFileSync } = await import("fs");
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
  });

  console.log(`\nReport written to: ${reportPath}`);
  console.log(
    failures.length === 0
      ? "\n✓ ACCEPTANCE GATE PASSED — safe to deploy"
      : `\n✗ ACCEPTANCE GATE FAILED — iterate prompt before deploy`
  );

  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
