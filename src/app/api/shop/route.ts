import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET() {
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
      return NextResponse.json(null);
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Shop GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingShop = await prisma.shop.findUnique({
      where: { userId },
    });

    if (existingShop) {
      return NextResponse.json(
        { error: "You already have a shop" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, category, phone, address, city, state, pincode } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }

    let slug = generateSlug(name);
    let isUnique = false;

    while (!isUnique) {
      const existing = await prisma.shop.findUnique({ where: { slug } });
      if (!existing) {
        isUnique = true;
      } else {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        description,
        category,
        phone,
        address,
        city,
        state,
        pincode,
        userId,
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Shop POST error:", error);
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, category, phone, address, city, state, pincode, isOpen, openTime, closeTime } = body;

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
        ...(openTime !== undefined && { openTime }),
        ...(closeTime !== undefined && { closeTime }),
      },
    });

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error("Shop PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update shop" },
      { status: 500 }
    );
  }
}
