import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.NEXTAUTH_SECRET;

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = await getToken({ req: request as never, secret: SECRET });
  return token?.sub || null;
}

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json([]);

    const orders = await prisma.order.findMany({
      where: { shopId: shop.id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
