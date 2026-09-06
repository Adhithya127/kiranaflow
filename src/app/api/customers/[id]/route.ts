import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          where: { shopId: shop.id },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const completedOrders = customer.orders.filter((o) => o.status === "completed");
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      ...customer,
      totalOrders: customer.orders.length,
      totalSpent,
    });
  } catch (error) {
    console.error("Customer GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}
