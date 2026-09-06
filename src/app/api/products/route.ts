import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { userId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Please create a shop first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, mrp, unit, stock, image, categoryId, sku, barcode } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        mrp: mrp ? parseFloat(mrp) : null,
        unit: unit || "piece",
        stock: stock ? parseInt(stock) : 0,
        image,
        categoryId: categoryId || null,
        sku,
        barcode,
        shopId: shop.id,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
