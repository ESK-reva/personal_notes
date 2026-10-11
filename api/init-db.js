
import { sql } from "./db.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const authHeader = req.headers.authorization;
    const initToken = process.env.INIT_DB_TOKEN;

    if (!initToken || authHeader !== `Bearer ${initToken}`) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS notes (
                id BIGSERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                favorite INTEGER NOT NULL DEFAULT 0,
                deleted_at TIMESTAMPTZ DEFAULT NULL
            )
        `;

        return res.status(200).json({
            message: "SHREYA database initialized successfully"
        });
    } catch (error) {
        console.error("Database initialization failed:", error);

        return res.status(500).json({
            error: "Database initialization failed"
        });
    }
}
