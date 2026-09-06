import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET;

export async function getUserId(request: NextRequest): Promise<string | null> {
  const token = await getToken({ req: request, secret: SECRET });
  return (token?.userId as string) || (token?.sub as string) || null;
}

export async function requireAuth(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId, error: null };
}

export async function getShopForUser(userId: string) {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  return shop;
}
