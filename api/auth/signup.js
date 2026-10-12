
import { sql } from "../db.js";
import { hash } from "bcryptjs";
import { createSession, setSessionCookie } from "../auth.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { email, password } = req.body ?? {};

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        password.length < 8 ||
        password.length > 72
    ) {
        return res.status(400).json({
            error: "Enter a valid email and a password of 8–72 characters."
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const passwordHash = await hash(password, 12);

        const [user] = await sql`
            INSERT INTO users (email, password_hash)
            VALUES (${normalizedEmail}, ${passwordHash})
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email
        `;

        if (!user) {
            return res.status(409).json({
                error: "An account with this email already exists."
            });
        }

        const token = await createSession(user);
        setSessionCookie(res, token);

        return res.status(201).json({
            user: {
                id: String(user.id),
                email: user.email
            }
        });
    } catch (error) {
        console.error("Signup API error:", error);

        return res.status(500).json({
            error: "Could not create your account."
        });
    }
}
