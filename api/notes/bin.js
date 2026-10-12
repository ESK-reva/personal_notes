
import { sql } from "../db.js";

export default async function handler(req, res) {
    try {
        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return res.status(405).json({
                error: "Method not allowed"
            });
        }

        const notes = await sql`
            SELECT *
            FROM notes
            WHERE deleted_at IS NOT NULL
            ORDER BY deleted_at DESC
        `;

        return res.status(200).json(notes);
    } catch (error) {
        console.error("Bin API error:", error);

        return res.status(500).json({
            error: "Failed to fetch Bin notes"
        });
    }
}
