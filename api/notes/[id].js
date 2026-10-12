
import { sql } from "../db.js";

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || !/^\d+$/.test(String(id))) {
        return res.status(400).json({
            error: "Invalid note ID"
        });
    }

    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const [note] = await sql`
            UPDATE notes
            SET deleted_at = NOW()
            WHERE id = ${id}
              AND deleted_at IS NULL
            RETURNING *
        `;

        if (!note) {
            return res.status(404).json({
                error: "Active note not found"
            });
        }

        return res.status(200).json({
            message: "Note moved to Bin successfully"
        });
    } catch (error) {
        console.error("Delete note API error:", error);

        return res.status(500).json({
            error: "Failed to move note to Bin"
        });
    }
}
