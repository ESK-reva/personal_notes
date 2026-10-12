
import { sql } from "../db.js";
import { compare } from "bcryptjs";
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
        !email.trim() ||
        !password ||
        password.length > 72
    ) {
        return res.status(400).json({
            error: "Enter a valid email and password."
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const [user] = await sql`
            SELECT id, email, password_hash
            FROM users
            WHERE email = ${normalizedEmail}
            LIMIT 1
        `;

        if (!user || !(await compare(password, user.password_hash))) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        const token = await createSession(user);
        setSessionCookie(res, token);

        return res.status(200).json({
            user: {
                id: String(user.id),
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login API error:", error);

        return res.status(500).json({
            error: "Could not log in."
        });
    }
}
