
import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
    const value = process.env.SESSION_SECRET;

    if (!value) {
        throw new Error("SESSION_SECRET is not configured");
    }

    return new TextEncoder().encode(value);
};

export async function createSession(user) {
    return new SignJWT({
        email: user.email
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}

export async function getSession(req) {
    const cookieHeader = req.headers.cookie || "";

    const token = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("shreya_session="))
        ?.slice("shreya_session=".length);

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(
            decodeURIComponent(token),
            getSecret()
        );

        if (!payload.sub) return null;

        return {
            id: payload.sub,
            email: payload.email
        };
    } catch {
        return null;
    }
}

export function setSessionCookie(res, token) {
    res.setHeader(
        "Set-Cookie",
        `shreya_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
    );
}

export function clearSessionCookie(res) {
    res.setHeader(
        "Set-Cookie",
        "shreya_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );
}
