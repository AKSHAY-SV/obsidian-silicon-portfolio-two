import { Type } from "@google/genai";
import { getGeminiClient } from "./utils/geminiClient.js";
import { promptBuilder } from "./utils/promptBuilder.js";
import { jsonValidator } from "./utils/jsonValidator.js";
import { fileWriter } from "./utils/fileWriter.js";
import { logger } from "./utils/logger.js";
import { withRetry } from "./utils/retry.js";

async function generateTrending() {
  logger.info("Starting autonomous Semiconductor Trends and Weekly Digest compiler...");
  try {
    const ai = getGeminiClient();
    const currentDate = new Date().toISOString().split("T")[0];
    const prompt = promptBuilder.buildTrendingPrompt(currentDate);

    logger.info("Executing Gemini model with Google Search Grounding tool (with retry safety)...");
    const response = await withRetry(() => 
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technologies: {
                type: Type.ARRAY,
                description: "Exactly 7 trending technologies representing high-precision subcomponents currently under active deployment.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Short title of the technology, e.g., Chiplets, HBM4, GAAFET, OpenLane, Sky130, RISC-V, Photonics" },
                    desc: { type: Type.STRING, description: "One-sentence technical summary of vertical silicon routing, standard cells, or interposers." },
                    status: { type: Type.STRING, description: "Compact snip status, e.g., 'Active Std', 'HBM4 Spec', '1.4nm GAA', 'Open PDK', 'Opto-Bus'" }
                  },
                  required: ["name", "desc", "status"]
                }
              },
              weeklyDigest: {
                type: Type.OBJECT,
                description: "Editorial focus and publication summary issue information.",
                properties: {
                  issue: { type: Type.INTEGER, description: "Digest issue number incremented past 142 (e.g., 143)" },
                  focus: { type: Type.STRING, description: "Central scientific focus of this weeks discoveries" },
                  editorial: { type: Type.STRING, description: "State-of-the-art editorial paragraph framing the physical synthesis and tapeout optimizations" }
                },
                required: ["issue", "focus", "editorial"]
              },
              statistics: {
                type: Type.OBJECT,
                description: "Semiconductor research metrics and aggregated activity scores.",
                properties: {
                  weeklyArticles: { type: Type.INTEGER, description: "Articles discovered and compiled this week" },
                  monthlyArticles: { type: Type.INTEGER, description: "Articles logged this month" },
                  mostDiscussedCompany: { type: Type.STRING, description: "Most mentioned company in standard node news" },
                  mostDiscussedTechnology: { type: Type.STRING, description: "Top ranking technology in publications" },
                  researchActivityScore: { type: Type.INTEGER, description: "Overall activity rating score out of 100" },
                  latestUpdate: { type: Type.STRING, description: "YYYY-MM-DD date representation of this compiler run" }
                },
                required: ["weeklyArticles", "monthlyArticles", "mostDiscussedCompany", "mostDiscussedTechnology", "researchActivityScore", "latestUpdate"]
              }
            },
            required: ["technologies", "weeklyDigest", "statistics"]
          }
        }
      })
    );

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Received empty text output from Gemini model.");
    }

    logger.info("Validating aggregated trends dataset schema...");
    const rawData = JSON.parse(textOutput);
    const validatedData = jsonValidator.validateTrending(rawData);

    logger.info("Writing validated dataset to trending.json...");
    fileWriter.writeJson("trending.json", validatedData);
    logger.success("Trending compiler run completed successfully!");
  } catch (error) {
    logger.error("Semiconductor Trends compiler run failed.", error);
    process.exit(1);
  }
}

generateTrending();
