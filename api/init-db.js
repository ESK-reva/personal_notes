
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
    
    if (process.env.DISABLE_DB_INIT === "true") {
        return res.status(403).json({
            error: "Database initialization is disabled."
        });
    }


    try {
 
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS notes (
                id BIGSERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                favorite INTEGER NOT NULL DEFAULT 0,
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );

            ALTER TABLE notes
            ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id);
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
