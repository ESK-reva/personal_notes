
import { sql } from "./db.js";

export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            const notes = await sql`
                SELECT *
                FROM notes
                WHERE deleted_at IS NULL
                ORDER BY id DESC
            `;

            return res.status(200).json(notes);
        }

        if (req.method === "POST") {
            const { title, content } = req.body ?? {};

            if (
                typeof title !== "string" ||
                title.trim() === ""
            ) {
                return res.status(400).json({
                    error: "Title is required"
                });
            }

            const [note] = await sql`
                INSERT INTO notes (title, content)
                VALUES (
                    ${title.trim()},
                    ${typeof content === "string" ? content.trim() : ""}
                )
                RETURNING *
            `;

            return res.status(201).json(note);
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({
            error: "Method not allowed"
        });
    } catch (error) {
        console.error("Notes API error:", error);

        return res.status(500).json({
            error: "Failed to process notes request"
        });
    }
}
