
import { sql } from "../db.js";
import { getSession } from "../auth.js";

export default async function handler(req, res) {
    try {
        const user = await getSession(req);

        if (!user) {
            return res.status(401).json({
                error: "Please log in to access your Bin."
            });
        }

        if (req.method !== "GET") {
            res.setHeader("Allow", "GET");
            return res.status(405).json({
                error: "Method not allowed"
            });
        }

        const notes = await sql`
            SELECT *
            FROM notes
            WHERE user_id = ${user.id}
              AND deleted_at IS NOT NULL
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
