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
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });

    if (!shop) {
      return NextResponse.json({
        productCount: 0,
        orderCount: 0,
        totalRevenue: 0,
        newOrders: 0,
        shopName: null,
      });
    }

    const [productCount, orderCount, revenueResult, newOrders] = await Promise.all([
      prisma.product.count({ where: { shopId: shop.id } }),
      prisma.order.count({ where: { shopId: shop.id } }),
      prisma.order.aggregate({
        where: { shopId: shop.id, status: { not: "cancelled" } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { shopId: shop.id, status: "new" } }),
    ]);

    return NextResponse.json({
      productCount,
      orderCount,
      totalRevenue: revenueResult._sum.total || 0,
      newOrders,
      shopName: shop.name,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
