import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const customers = await prisma.customer.findMany({
      where: {
        orders: { some: { shopId: shop.id } },
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        orders: {
          where: { shopId: shop.id },
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = customers.map((c) => {
      const completedOrders = c.orders.filter((o) => o.status === "completed");
      const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        createdAt: c.createdAt,
        totalOrders: c.orders.length,
        totalSpent,
        lastOrderDate: c.orders[0]?.createdAt || null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
