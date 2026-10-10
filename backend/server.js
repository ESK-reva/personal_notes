
const express = require("express");
const db = require("./db");

const app = express();
app.get("/", (req, res) => {
    res.json({
        message: "SHREYA backend is running",
        version: "diagnostic-check"
    });
});
const PORT = process.env.PORT || 3000;

// Allow local development and the deployed Vercel frontend
const allowedOrigins = [
    "http://localhost:5173",
    "https://personal-notes-gamma.vercel.app"
];

// Allow React frontend to communicate with this backend
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running" });
});

// Get active notes only
app.get("/api/notes", (req, res) => {
    const notes = db
        .prepare(
            "SELECT * FROM notes WHERE deleted_at IS NULL ORDER BY id DESC"
        )
        .all();

    res.json(notes);
});

// Get notes currently in the Bin
app.get("/api/notes/bin", (req, res) => {
    const notes = db
        .prepare(
            "SELECT * FROM notes WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
        )
        .all();

    res.json(notes);
});

// Add a new note
app.post("/api/notes", (req, res) => {
    const { title, content } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const stmt = db.prepare(
        "INSERT INTO notes (title, content) VALUES (?, ?)"
    );

    const result = stmt.run(
        title.trim(),
        typeof content === "string" ? content.trim() : ""
    );

    const newNote = db
        .prepare("SELECT * FROM notes WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(newNote);
});

// Move a note to the Bin instead of permanently deleting it
app.delete("/api/notes/:id", (req, res) => {
    const { id } = req.params;

    const result = db
        .prepare(
            `UPDATE notes
             SET deleted_at = CURRENT_TIMESTAMP
             WHERE id = ? AND deleted_at IS NULL`
        )
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Active note not found"
        });
    }

    res.json({
        message: "Note moved to Bin successfully"
    });
});

// Restore a note from the Bin
app.patch("/api/notes/:id/restore", (req, res) => {
    const { id } = req.params;

    const result = db
        .prepare(
            `UPDATE notes
             SET deleted_at = NULL
             WHERE id = ? AND deleted_at IS NOT NULL`
        )
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Note not found in Bin"
        });
    }

    const restoredNote = db
        .prepare("SELECT * FROM notes WHERE id = ?")
        .get(id);

    res.json(restoredNote);
});

// Toggle favorite status for active notes
app.patch("/api/notes/:id/favorite", (req, res) => {
    const { id } = req.params;

    const note = db
        .prepare(
            "SELECT * FROM notes WHERE id = ? AND deleted_at IS NULL"
        )
        .get(id);

    if (!note) {
        return res.status(404).json({
            error: "Active note not found"
        });
    }

    const newFavoriteStatus = note.favorite === 1 ? 0 : 1;

    db.prepare(
        "UPDATE notes SET favorite = ? WHERE id = ?"
    ).run(newFavoriteStatus, id);

    const updatedNote = db
        .prepare("SELECT * FROM notes WHERE id = ?")
        .get(id);

    res.json(updatedNote);
});

// Permanently delete a note from the Bin
app.delete("/api/notes/:id/permanent", (req, res) => {
    const { id } = req.params;

    const result = db
        .prepare(
            "DELETE FROM notes WHERE id = ? AND deleted_at IS NOT NULL"
        )
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Note not found in Bin"
        });
    }

    res.json({
        message: "Note permanently deleted"
    });
});

// Permanently delete notes that have been in the Bin for more than 12 hours
const cleanupOldNotes = () => {
    const result = db.prepare(`
        DELETE FROM notes
        WHERE deleted_at IS NOT NULL
          AND datetime(deleted_at) <= datetime('now', '-12 hours')
    `).run();

    if (result.changes > 0) {
        console.log(
            `Bin cleanup: permanently deleted ${result.changes} expired note(s).`
        );
    }
};

// Run once when the backend starts
cleanupOldNotes();

// Check every 5 minutes
setInterval(cleanupOldNotes, 5 * 60 * 1000);

// Start server using Render's assigned port
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server running on port ${PORT}`);
});
