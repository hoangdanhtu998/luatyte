// Cơ sở dữ liệu SQLite (node:sqlite có sẵn từ Node 22.13).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked')),
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      totp_last_step INTEGER NOT NULL DEFAULT -1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exp INTEGER NOT NULL,
      mfa_ok INTEGER NOT NULL DEFAULT 0,
      csrf TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      version TEXT NOT NULL,
      agreed_at TEXT NOT NULL,
      ip TEXT
    );
    -- Phase 2: gói cước, mã giảm giá, đơn hàng, gói đang dùng, nhắc gia hạn
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration_days INTEGER NOT NULL,            -- -1 = trọn đời
      price INTEGER NOT NULL CHECK (price >= 0),
      currency TEXT NOT NULL DEFAULT 'VND',
      features TEXT NOT NULL DEFAULT '{}',       -- JSON
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE COLLATE NOCASE,
      type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
      value INTEGER NOT NULL CHECK (value > 0),
      max_uses INTEGER NOT NULL DEFAULT -1,      -- -1 = không giới hạn
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT,
      plan_id INTEGER REFERENCES plans(id),      -- null = mọi gói
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      gateway TEXT NOT NULL,
      amount INTEGER NOT NULL,
      discount_code TEXT,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      final_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
      provider_txn TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id INTEGER NOT NULL REFERENCES plans(id),
      starts_at INTEGER NOT NULL,
      ends_at INTEGER,                           -- null = trọn đời
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired'))
    );
    CREATE TABLE IF NOT EXISTS reminder_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER NOT NULL UNIQUE REFERENCES subscriptions(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      sent_at TEXT NOT NULL,
      result TEXT NOT NULL
    );
    -- Phase 4 và 3: cài đặt (bí mật mã hóa), nhật ký đăng nhập, nhật ký thao tác admin
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      is_secret INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      success INTEGER NOT NULL,
      failed_reason TEXT,
      logged_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      old_value TEXT,
      new_value TEXT,
      ip TEXT,
      logged_at INTEGER NOT NULL
    );
    -- Phase 3: hàng đợi email (gửi nền, thử lại, ghi log)
    CREATE TABLE IF NOT EXISTS email_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_address TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at INTEGER NOT NULL,
      last_error TEXT,
      created_at TEXT NOT NULL,
      tried_at TEXT
    );
    -- Phase 5: lỗi hệ thống, cảnh báo
    CREATE TABLE IF NOT EXISTS system_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS system_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
      created_at INTEGER NOT NULL,
      resolved_at INTEGER
    );
    -- Phase 6: nội dung luật và tin luật
    CREATE TABLE IF NOT EXISTS law_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER REFERENCES law_categories(id),
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS law_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES law_categories(id),
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      verified_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS law_news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published_at INTEGER,
      is_published INTEGER NOT NULL DEFAULT 0
    );
    -- Phase 7: chi phí và chi phí AI
    CREATE TABLE IF NOT EXISTS cost_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
      amount INTEGER NOT NULL CHECK (amount >= 0),
      period_start INTEGER NOT NULL,
      period_end INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_usage (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
    CREATE TABLE IF NOT EXISTS ip_visits (
      day TEXT NOT NULL,
      ip TEXT NOT NULL,
      hits INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (day, ip)
    );
    CREATE TABLE IF NOT EXISTS ad_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placement TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      link_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      feature TEXT NOT NULL,
      tokens INTEGER NOT NULL,
      cost_usd REAL NOT NULL,
      created_at INTEGER NOT NULL
    );
    -- Đồng bộ tiến độ học của app luật y tế (một bản ghi mỗi tài khoản)
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  // Migration: thêm tên đăng nhập cho cơ sở dữ liệu đã có. Không trùng, không phân biệt hoa thường.
  const cols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  if (!cols.includes('username')) db.exec('ALTER TABLE users ADD COLUMN username TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_username_uq ON users(username COLLATE NOCASE)');
  return db;
}
