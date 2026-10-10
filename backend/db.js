const Database = require("better-sqlite3");

const db = new Database("notes.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add favorite column if it does not already exist
const columns = db
  .prepare("PRAGMA table_info(notes)")
  .all();

const hasFavoriteColumn = columns.some(
  (column) => column.name === "favorite"
);

if (!hasFavoriteColumn) {
  db.exec(`
    ALTER TABLE notes
    ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0
  `);
}

module.exports = db;