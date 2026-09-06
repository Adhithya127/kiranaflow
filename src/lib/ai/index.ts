import { VisionProvider } from "./types";
import { OpenAIVisionProvider } from "./openai-vision";

let providerInstance: VisionProvider | null = null;

export function getVisionProvider(): VisionProvider {
  if (providerInstance) return providerInstance;

  if (process.env.OPENAI_API_KEY) {
    providerInstance = new OpenAIVisionProvider();
    return providerInstance;
  }

  throw new Error(
    "No vision provider configured. Set OPENAI_API_KEY environment variable."
  );
}

export type { VisionProvider, ProductRecognition } from "./types";
