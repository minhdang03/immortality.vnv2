/**
 * Notion API client for reading knowledge base database pages.
 * Read-only. Respects 3 req/sec rate limit with 350ms inter-request sleep.
 * Handles pagination — returns all pages regardless of DB size.
 *
 * Notion integration token must have "Read content" capability
 * and be shared with the target database.
 */

/** Normalized knowledge page — stripped of Notion envelope cruft. */
export interface NotionKnowledgePage {
  notionPageId: string;
  title: string;
  slug: string;
  tags: string[];
  bodyMarkdown: string;
  lastEditedTime: string; // ISO 8601
  published: boolean;
}

/** Raw Notion page as returned by database query endpoint. */
interface NotionPage {
  id: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
}

// Notion API returns many property types; we only care about a subset.
// Using a loose type here and narrowing via RawProp casts in extractors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotionProperty = { type: string; [key: string]: any };

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface NotionBlocksResponse {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor: string | null;
}

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_API_VERSION = "2022-06-28";
const RATE_LIMIT_DELAY_MS = 350; // 3 req/sec safe margin

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function notionFetch(
  token: string,
  method: string,
  path: string,
  body?: unknown,
  retryCount = 0
): Promise<unknown> {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Rate limited — back off exponentially
  if (res.status === 429) {
    if (retryCount >= 4) throw new Error("Notion rate limit: max retries exceeded");
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "1", 10);
    await sleep((retryAfter * 1000 + 200) * Math.pow(2, retryCount));
    return notionFetch(token, method, path, body, retryCount + 1);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API ${res.status} on ${path}: ${err}`);
  }

  return res.json();
}

/** Extract plain text from a Notion property (handles title, rich_text, select, url). */
function extractText(prop: NotionProperty | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title as Array<{ plain_text: string }>).map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return (prop.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join("");
  if (prop.type === "select") return (prop.select as { name: string } | null)?.name ?? "";
  if (prop.type === "url") return (prop.url as string | null) ?? "";
  return "";
}

function extractTags(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select as Array<{ name: string }>).map((s) => s.name);
}

function extractCheckbox(prop: NotionProperty | undefined): boolean {
  if (!prop || prop.type !== "checkbox") return false;
  return Boolean(prop.checkbox);
}

/**
 * Convert a Notion block to Markdown text (flat, no recursion for simplicity).
 * Covers: paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item,
 *         code, quote, divider, callout.
 */
function blockToMarkdown(block: NotionBlock): string {
  const { type } = block;
  const richTexts: Array<{ plain_text: string; annotations?: { bold?: boolean; italic?: boolean; code?: boolean } }> =
    block[type]?.rich_text ?? [];
  const plainText = richTexts
    .map((t) => {
      let text = t.plain_text;
      if (t.annotations?.code) text = `\`${text}\``;
      if (t.annotations?.bold) text = `**${text}**`;
      if (t.annotations?.italic) text = `_${text}_`;
      return text;
    })
    .join("");

  switch (type) {
    case "paragraph": return plainText ? `${plainText}\n\n` : "\n";
    case "heading_1": return `# ${plainText}\n\n`;
    case "heading_2": return `## ${plainText}\n\n`;
    case "heading_3": return `### ${plainText}\n\n`;
    case "bulleted_list_item": return `- ${plainText}\n`;
    case "numbered_list_item": return `1. ${plainText}\n`;
    case "code": {
      const lang = block.code?.language ?? "";
      const code = (block.code?.rich_text ?? [])
        .map((t: { plain_text: string }) => t.plain_text)
        .join("");
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    }
    case "quote": return `> ${plainText}\n\n`;
    case "divider": return `---\n\n`;
    case "callout": return `> **${block.callout?.icon?.emoji ?? ""}** ${plainText}\n\n`;
    default: return plainText ? `${plainText}\n\n` : "";
  }
}

/**
 * Fetch all blocks for a page, paginated. Returns Markdown string.
 * Adds 350ms delay between pagination calls to respect rate limits.
 */
async function fetchPageBodyMarkdown(token: string, pageId: string): Promise<string> {
  let markdown = "";
  let cursor: string | null = null;
  let hasMore = true;
  let isFirst = true;

  while (hasMore) {
    if (!isFirst) await sleep(RATE_LIMIT_DELAY_MS);
    isFirst = false;

    const params = cursor ? `?start_cursor=${cursor}` : "";
    const data = (await notionFetch(
      token,
      "GET",
      `/blocks/${pageId}/children${params}`
    )) as NotionBlocksResponse;

    for (const block of data.results) {
      markdown += blockToMarkdown(block);
    }

    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return markdown.trim();
}

/**
 * Query all pages from a Notion database, paginated.
 * Sleeps 350ms between requests. Returns normalized NotionKnowledgePage[].
 *
 * Expected Notion DB property schema:
 *   - Name / Title (title type) → page title
 *   - Slug (rich_text) → URL slug
 *   - Tags (multi_select) → topic tags
 *   - Published (checkbox) → visibility flag
 */
export async function fetchAllKnowledgePages(
  token: string,
  databaseId: string
): Promise<NotionKnowledgePage[]> {
  const pages: NotionKnowledgePage[] = [];
  let cursor: string | null = null;
  let hasMore = true;
  let isFirst = true;

  while (hasMore) {
    if (!isFirst) await sleep(RATE_LIMIT_DELAY_MS);
    isFirst = false;

    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const data = (await notionFetch(
      token,
      "POST",
      `/databases/${databaseId}/query`,
      body
    )) as NotionQueryResponse;

    for (const page of data.results) {
      await sleep(RATE_LIMIT_DELAY_MS); // rate limit: one extra call per page for blocks

      let bodyMarkdown = "";
      try {
        bodyMarkdown = await fetchPageBodyMarkdown(token, page.id);
      } catch (err) {
        console.warn(`[notion-client] Failed to fetch blocks for ${page.id}: ${err}`);
      }

      const title = extractText(page.properties["Name"] ?? page.properties["Title"]);
      const slug =
        extractText(page.properties["Slug"]) ||
        title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      pages.push({
        notionPageId: page.id,
        title,
        slug,
        tags: extractTags(page.properties["Tags"]),
        bodyMarkdown,
        lastEditedTime: page.last_edited_time,
        published: extractCheckbox(page.properties["Published"]),
      });
    }

    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return pages;
}
