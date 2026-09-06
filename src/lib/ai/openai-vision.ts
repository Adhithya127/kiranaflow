import OpenAI from "openai";
import { ProductRecognition, VisionProvider } from "./types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class OpenAIVisionProvider implements VisionProvider {
  private client: OpenAI;

  constructor() {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    this.client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  async recognizeProduct(
    imageBase64: string,
    mimeType: string
  ): Promise<ProductRecognition> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a product recognition AI for Indian local retail shops (kirana stores).
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
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Identify this product and return the JSON. If there is any price/MRP visible, include it.",
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || "";

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
