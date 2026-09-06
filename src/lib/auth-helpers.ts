import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

interface JwtPayload {
  sub?: string;
  userId?: string;
  role?: string;
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );

    const tokenValue =
      cookies["__Secure-authjs.session-token"] ||
      cookies["authjs.session-token"] ||
      cookies["__Secure-next-auth.session-token"] ||
      cookies["next-auth.session-token"];

    if (!tokenValue) return null;

    const { payload } = await jwtVerify<JwtPayload>(tokenValue, secret);
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error("JWT verify error:", error);
    return null;
  }
}
