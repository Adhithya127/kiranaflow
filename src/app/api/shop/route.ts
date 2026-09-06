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
    if (!shop) return NextResponse.json(null);
    return NextResponse.json(shop);
  } catch (error) {
    console.error("Shop GET error:", error);
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingShop = await prisma.shop.findUnique({ where: { userId } });
    if (existingShop) {
      return NextResponse.json({ error: "You already have a shop" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, category, phone, address, city, state, pincode } = body;

    if (!name) {
      return NextResponse.json({ error: "Shop name is required" }, { status: 400 });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.shop.findUnique({ where: { slug } });
      if (!existing) isUnique = true;
      else slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const shop = await prisma.shop.create({
      data: { name, slug, description, category, phone, address, city, state, pincode, userId },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Shop POST error:", error);
    return NextResponse.json({ error: "Failed to create shop" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shop = await prisma.shop.findUnique({ where: { userId } });
    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

    const body = await request.json();
    const { name, description, category, phone, address, city, state, pincode, isOpen } = body;

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode }),
        ...(isOpen !== undefined && { isOpen }),
      },
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error("Shop PUT error:", error);
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
  }
}
