import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let clientInstance = null;

export function getGeminiClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required but is not defined.");
  }

  clientInstance = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  return clientInstance;
}
