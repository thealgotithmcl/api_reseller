-- Cloudflare D1 Schema for backenimg2img

DROP TABLE IF EXISTS api_keys;

CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  quota INTEGER -- NULL for unlimited
);

-- Optional: You can add an index for faster lookups on the api_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_key ON api_keys (api_key);
