
import { sql } from "./db.js";
import { hash, compare } from "bcryptjs";
import {
    createSession,
    setSessionCookie,
    clearSessionCookie,
    getSession
} from "./auth.js";

export default async function handler(req, res) {
    const action = req.query.action;

    try {
        if (action === "signup" && req.method === "POST") {
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
                user: { id: String(user.id), email: user.email }
            });
        }

        if (action === "login" && req.method === "POST") {
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
                user: { id: String(user.id), email: user.email }
            });
        }

        if (action === "logout" && req.method === "POST") {
            clearSessionCookie(res);
            return res.status(200).json({
                message: "Logged out successfully"
            });
        }

        if (action === "me" && req.method === "GET") {
            const user = await getSession(req);

            if (!user) {
                return res.status(401).json({
                    error: "Not authenticated"
                });
            }

            return res.status(200).json({
                user: { id: user.id, email: user.email }
            });
        }

        return res.status(404).json({
            error: "Unknown authentication action"
        });
    } catch (error) {
        console.error("Auth handler error:", error);

        return res.status(500).json({
            error: "Authentication request failed"
        });
    }
}
