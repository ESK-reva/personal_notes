
import { getSession } from "../auth.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const user = await getSession(req);

        if (!user) {
            return res.status(401).json({
                error: "Not authenticated"
            });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Session API error:", error);

        return res.status(500).json({
            error: "Could not check session"
        });
    }
}
