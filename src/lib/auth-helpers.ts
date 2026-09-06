import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET;

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token) return null;
    return (token.userId as string) || token.sub || null;
  } catch (error) {
    console.error("getToken error:", error);
    return null;
  }
}
