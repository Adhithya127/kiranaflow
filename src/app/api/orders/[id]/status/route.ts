import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder || existingOrder.shopId !== shop.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["new", "confirmed", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, items: { include: { product: true } } },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
