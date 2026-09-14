const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

// Allow React frontend to communicate with this backend
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    next();
});

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running" });
});

// Get all notes
app.get("/api/notes", (req, res) => {
    const notes = db
        .prepare("SELECT * FROM notes ORDER BY id DESC")
        .all();

    res.json(notes);
});

// Add a new note
app.post("/api/notes", (req, res) => {
    const { title, content } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const stmt = db.prepare(
        "INSERT INTO notes (title, content) VALUES (?, ?)"
    );

    const result = stmt.run(
        title.trim(),
        content ? content.trim() : ""
    );

    const newNote = db
        .prepare("SELECT * FROM notes WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(newNote);
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});