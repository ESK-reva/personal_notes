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

// Get existing table columns
const columns = db
  .prepare("PRAGMA table_info(notes)")
  .all();

// Add favorite column if it does not exist
const hasFavoriteColumn = columns.some(
  (column) => column.name === "favorite"
);

if (!hasFavoriteColumn) {
  db.exec(`
    ALTER TABLE notes
    ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0
  `);
}

// Refresh the column list after the favorite migration
const updatedColumns = db
  .prepare("PRAGMA table_info(notes)")
  .all();

// Add deleted_at column if it does not exist
const hasDeletedAtColumn = updatedColumns.some(
  (column) => column.name === "deleted_at"
);

if (!hasDeletedAtColumn) {
  db.exec(`
    ALTER TABLE notes
    ADD COLUMN deleted_at TEXT DEFAULT NULL
  `);
}

module.exports = db;