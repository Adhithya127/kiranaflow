import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getVisionProvider } from "@/lib/ai";

const SECRET = process.env.NEXTAUTH_SECRET;

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = await getToken({ req: request as never, secret: SECRET });
  return token?.sub || null;
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const provider = getVisionProvider();
    const result = await provider.recognizeProduct(base64Data, mimeType || "image/jpeg");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Product recognition error:", error);
    return NextResponse.json(
      {
        error: "Failed to recognize product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
