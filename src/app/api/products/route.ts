import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.NEXTAUTH_SECRET;

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = await getToken({ req: request as never, secret: SECRET });
  return token?.sub || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopSlug = searchParams.get("shop");
  const search = searchParams.get("search");
  const categoryId = searchParams.get("category");

  try {
    let shopId: string | undefined;

    if (shopSlug) {
      const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
      if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      shopId = shop.id;
    }

    const where: Record<string, unknown> = {};
    if (shopId) where.shopId = shopId;
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: "insensitive" };
    where.isAvailable = true;

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) {
      return NextResponse.json({ error: "Please create a shop first" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, price, mrp, unit, stock, image, categoryId, sku, barcode } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
