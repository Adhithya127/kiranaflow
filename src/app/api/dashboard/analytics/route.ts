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

    const [
      dailyRevenue,
      topProducts,
      orderStatusBreakdown,
      summary,
      recentOrders,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total) as revenue
        FROM "Order"
        WHERE shop_id = ${shop.id}
          AND status != 'cancelled'
          AND created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.$queryRaw`
        SELECT
          p.name as product_name,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.total) as total_revenue
        FROM "OrderItem" oi
        JOIN "Order" o ON oi.order_id = o.id
        JOIN "Product" p ON oi.product_id = p.id
        WHERE o.shop_id = ${shop.id}
          AND o.status != 'cancelled'
          AND o.created_at >= ${thirtyDaysAgo}
        GROUP BY p.name
        ORDER BY total_quantity DESC
        LIMIT 10
      `,
      prisma.order.groupBy({
        by: ["status"],
        where: { shopId: shop.id, createdAt: { gte: thirtyDaysAgo } },
        _count: { status: true },
      }),
      prisma.order.aggregate({
        where: { shopId: shop.id, status: { not: "cancelled" }, createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        _count: { id: true },
        _avg: { total: true },
      }),
      prisma.order.findMany({
        where: { shopId: shop.id, createdAt: { gte: sevenDaysAgo } },
        include: { items: { include: { product: true } }, customer: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const statusMap: Record<string, number> = {};
    orderStatusBreakdown.forEach((s) => {
      statusMap[s.status] = s._count.status;
    });

    return NextResponse.json({
      dailyRevenue: (dailyRevenue as Array<{ date: Date; order_count: bigint; revenue: bigint }>).map((d) => ({
        date: d.date,
        orders: Number(d.order_count),
        revenue: Number(d.revenue),
      })),
      topProducts: (topProducts as Array<{ product_name: string; total_quantity: bigint; total_revenue: bigint }>).map((p) => ({
        name: p.product_name,
        quantity: Number(p.total_quantity),
        revenue: Number(p.total_revenue),
      })),
      orderStatusBreakdown: statusMap,
      summary: {
        totalRevenue: summary._sum.total || 0,
        totalOrders: summary._count.id || 0,
        avgOrderValue: summary._avg.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
