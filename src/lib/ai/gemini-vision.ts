import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductRecognition, VisionProvider } from "./types";

export class GeminiVisionProvider implements VisionProvider {
  private client: GoogleGenerativeAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async recognizeProduct(
    imageBase64: string,
    mimeType: string
  ): Promise<ProductRecognition> {
    const model = this.client.getGenerativeModel({ model: this.modelName });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        },
      },
      `You are a product recognition AI for Indian local retail shops (kirana stores).
Analyze the product image and return a JSON object with these fields:
- name: Product name (as commonly known in India, include brand if visible)
- description: Brief product description (1-2 lines)
- category: One of: Groceries, Dairy & Beverages, Snacks, Household, Personal Care, Electronics, Stationery, Other
- unit: One of: piece, kg, gram, litre, packet, box, bottle, strip, dozen
- mrp: Maximum Retail Price as a number if visible on packaging, otherwise null
- confidence: How confident you are (0.0 to 1.0)

Important:
- Use Indian product names and conventions
- Price should be in Indian Rupees
- If you cannot identify the product, set confidence to a low value
- Return ONLY the JSON object, no other text
- Do not hallucinate prices. Only include MRP if clearly visible.`,
    ]);

    const content = result.response.text() || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        name: parsed.name || "Unknown Product",
        description: parsed.description || "",
        category: parsed.category || "Other",
        unit: parsed.unit || "piece",
        mrp: typeof parsed.mrp === "number" ? parsed.mrp : null,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      };
    } catch {
      return {
        name: "Unknown Product",
        description: "Could not identify product from image",
        category: "Other",
        unit: "piece",
        mrp: null,
        confidence: 0,
      };
    }
  }
}
