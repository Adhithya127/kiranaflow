import { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const allCookies: Record<string, string> = {};
    for (const c of cookieHeader.split(";")) {
      const eqIndex = c.indexOf("=");
      if (eqIndex === -1) continue;
      const key = c.substring(0, eqIndex).trim();
      const val = c.substring(eqIndex + 1).trim();
      allCookies[key] = val;
    }

    const cookieNames = [
      "__Secure-authjs.session-token",
      "authjs.session-token",
    ];

    for (const cookieName of cookieNames) {
      const tokenValue = allCookies[cookieName];
      if (!tokenValue) continue;

      const token = await decode({
        token: tokenValue,
        secret: SECRET,
        salt: cookieName,
      });

      if (token) {
        return (token.userId as string) || (token.sub as string) || null;
      }
    }

    return null;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}
