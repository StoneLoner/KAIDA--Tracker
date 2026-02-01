const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'kaida.db'));

// Create links table
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    last_checked DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create alerts table
db.exec(`
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES links(id)
  )
`);

// Create events table for detailed analytics
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER,
    type TEXT, -- 'click' or 'conversion'
    referrer TEXT,
    user_agent TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(link_id) REFERENCES links(id)
  )
`);

module.exports = db;
