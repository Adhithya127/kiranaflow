import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const nonCancelledOrders = await prisma.order.findMany({
      where: { shopId: shop.id, status: { not: "cancelled" }, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyRevenueMap: Record<string, { orders: number; revenue: number }> = {};
    nonCancelledOrders.forEach((o) => {
      const date = o.createdAt.toISOString().split("T")[0];
      if (!dailyRevenueMap[date]) dailyRevenueMap[date] = { orders: 0, revenue: 0 };
      dailyRevenueMap[date].orders += 1;
      dailyRevenueMap[date].revenue += o.total;
    });
    const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, v]) => ({
      date,
      ...v,
    }));

    const orderItems = await prisma.orderItem.findMany({
      where: { order: { shopId: shop.id, status: { not: "cancelled" }, createdAt: { gte: thirtyDaysAgo } } },
      include: { product: { select: { name: true } } },
    });

    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orderItems.forEach((item) => {
      const key = item.productId;
      if (!productMap[key]) productMap[key] = { name: item.product.name, quantity: 0, revenue: 0 };
      productMap[key].quantity += item.quantity;
      productMap[key].revenue += item.total;
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ["status"],
      where: { shopId: shop.id, createdAt: { gte: thirtyDaysAgo } },
      _count: { status: true },
    });

    const statusMap: Record<string, number> = {};
    orderStatusBreakdown.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    const summary = await prisma.order.aggregate({
      where: { shopId: shop.id, status: { not: "cancelled" }, createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
      _count: { id: true },
      _avg: { total: true },
    });

    return NextResponse.json({
      dailyRevenue,
      topProducts,
      orderStatusBreakdown: statusMap,
      summary: {
        totalRevenue: summary._sum.total || 0,
        totalOrders: summary._count.id || 0,
        avgOrderValue: summary._avg.total || 0,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
