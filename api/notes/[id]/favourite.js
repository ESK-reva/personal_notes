
import { sql } from "../../db.js";

export default async function handler(req, res) {
    if (req.method !== "PATCH") {
        res.setHeader("Allow", "PATCH");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { id } = req.query;

    if (!id || !/^\d+$/.test(String(id))) {
        return res.status(400).json({
            error: "Invalid note ID"
        });
    }

    try {
        const [note] = await sql`
            UPDATE notes
            SET favorite = CASE
                WHEN favorite = 1 THEN 0
                ELSE 1
            END
            WHERE id = ${id}
              AND deleted_at IS NULL
            RETURNING *
        `;

        if (!note) {
            return res.status(404).json({
                error: "Active note not found"
            });
        }

        return res.status(200).json(note);
    } catch (error) {
        console.error("Favorite API error:", error);

        return res.status(500).json({
            error: "Failed to update favorite"
        });
    }
}
