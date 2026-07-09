-- Migration 0001: agent content platform foundation.
-- content = edge replica of Firestore canonical docs (unified across 5 content types).
-- content_fts = external-content FTS5; remove_diacritics=2 makes Vietnamese search
-- accent-insensitive ("bat tu" matches "Bất Tử") — acceptance-critical for VI.

CREATE TABLE content (
  id TEXT PRIMARY KEY,            -- Firestore doc id (canonical)
  type TEXT NOT NULL CHECK (type IN ('article','story','khaitri','teaching','practice')),
  source_ref TEXT,                -- agent idempotency key (external_id)
  content_hash TEXT,              -- sha256 of canonical body for dedup
  vi_slug TEXT,
  en_slug TEXT,
  vi_title TEXT,
  en_title TEXT,
  vi_summary TEXT,
  en_summary TEXT,
  vi_body TEXT,
  en_body TEXT,
  topic TEXT,
  tags TEXT,                      -- JSON array string
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo_meta TEXT,                  -- JSON
  embedded INTEGER NOT NULL DEFAULT 0,  -- 0=pending Vectorize upsert (cron backfill), 1=done
  created_at TEXT,
  updated_at TEXT,
  created_by TEXT                 -- agent_name or admin uid
);

CREATE UNIQUE INDEX idx_content_sourceref ON content(source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX idx_content_type_status ON content(type, status);
CREATE INDEX idx_content_hash ON content(content_hash);
CREATE INDEX idx_content_embedded ON content(embedded) WHERE embedded = 0;
CREATE INDEX idx_content_vi_slug ON content(vi_slug);
CREATE INDEX idx_content_en_slug ON content(en_slug);

CREATE VIRTUAL TABLE content_fts USING fts5(
  vi_title, en_title, vi_summary, en_summary, vi_body, en_body,
  content='content', content_rowid='rowid',
  tokenize="unicode61 remove_diacritics 2"
);

-- External-content FTS sync triggers (insert / delete / update).
CREATE TRIGGER content_ai AFTER INSERT ON content BEGIN
  INSERT INTO content_fts(rowid, vi_title, en_title, vi_summary, en_summary, vi_body, en_body)
  VALUES (new.rowid, new.vi_title, new.en_title, new.vi_summary, new.en_summary, new.vi_body, new.en_body);
END;

CREATE TRIGGER content_ad AFTER DELETE ON content BEGIN
  INSERT INTO content_fts(content_fts, rowid, vi_title, en_title, vi_summary, en_summary, vi_body, en_body)
  VALUES ('delete', old.rowid, old.vi_title, old.en_title, old.vi_summary, old.en_summary, old.vi_body, old.en_body);
END;

CREATE TRIGGER content_au AFTER UPDATE ON content BEGIN
  INSERT INTO content_fts(content_fts, rowid, vi_title, en_title, vi_summary, en_summary, vi_body, en_body)
  VALUES ('delete', old.rowid, old.vi_title, old.en_title, old.vi_summary, old.en_summary, old.vi_body, old.en_body);
  INSERT INTO content_fts(rowid, vi_title, en_title, vi_summary, en_summary, vi_body, en_body)
  VALUES (new.rowid, new.vi_title, new.en_title, new.vi_summary, new.en_summary, new.vi_body, new.en_body);
END;

-- Per-agent API keys. Raw key never stored — SHA-256 hash only (show-once on create).
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  scopes TEXT NOT NULL,           -- comma list: content:read,content:write,media:write
  created_at TEXT,
  created_by TEXT,                -- Firebase admin uid
  revoked_at TEXT,
  last_used_at TEXT
);

CREATE INDEX idx_api_keys_active ON api_keys(key_hash) WHERE revoked_at IS NULL;

-- Audit trail: which agent did what, when, at what cost.
CREATE TABLE agent_audit_log (
  id TEXT PRIMARY KEY,
  key_id TEXT,
  agent_name TEXT,
  action TEXT,                    -- content.create | content.update | media.upload | search | ...
  content_id TEXT,
  ts TEXT,
  status_code INTEGER,
  neurons_used INTEGER DEFAULT 0,
  detail TEXT
);

CREATE INDEX idx_audit_ts ON agent_audit_log(ts);
CREATE INDEX idx_audit_key ON agent_audit_log(key_id, ts);

-- Taxonomy cache (topics/tags) — enrich pipeline suggests against this list.
CREATE TABLE taxonomy (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('topic','tag')),
  vi TEXT,
  en TEXT,
  slug TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_taxonomy_kind ON taxonomy(kind);
