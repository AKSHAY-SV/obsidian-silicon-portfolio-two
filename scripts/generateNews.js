import { Type } from "@google/genai";
import { getGeminiClient } from "./utils/geminiClient.js";
import { promptBuilder } from "./utils/promptBuilder.js";
import { jsonValidator } from "./utils/jsonValidator.js";
import { fileWriter } from "./utils/fileWriter.js";
import { logger } from "./utils/logger.js";
import { withRetry } from "./utils/retry.js";

async function generateNews() {
  logger.info("Starting autonomous Semiconductor News generator...");
  try {
    const ai = getGeminiClient();
    const currentDate = new Date().toISOString().split("T")[0];
    const prompt = promptBuilder.buildNewsPrompt(currentDate);

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
              news: {
                type: Type.ARRAY,
                description: "List of latest, real semiconductor news, industry announcements, and tech launches.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique identifier (e.g. news-1, news-2)" },
                    title: { type: Type.STRING, description: "Professional title of the news story" },
                    category: { type: Type.STRING, description: "Category: must be one of ASIC, FPGA, EDA, Embedded, AI Hardware, Physical Design, Foundries, Computer Architecture" },
                    summary: { type: Type.STRING, description: "Highly sophisticated IEEE Spectrum-style summary of the announcement" },
                    whyItMatters: { type: Type.STRING, description: "Detailed paragraph explaining the hardware or architectural relevance" },
                    industryImpact: { type: Type.STRING, description: "Detailed paragraph detailing the commercial and standard cell layout implications" },
                    difficulty: { type: Type.STRING, description: "Difficulty level: Beginner, Intermediate, Advanced, or Expert" },
                    readingTime: { type: Type.STRING, description: "Estimated reading time, e.g., '6 min read'" },
                    technologyTags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "3-4 technical tags, e.g., ['TSMC N2', 'BSPDN', 'Silicon Photonics']"
                    },
                    company: { type: Type.STRING, description: "Principal company/organization involved" },
                    publishedDate: { type: Type.STRING, description: "Date of publication in YYYY-MM-DD format" },
                    source: { type: Type.STRING, description: "News publication source, e.g., EE Times, IEEE Spectrum" },
                    url: { type: Type.STRING, description: "Actual source URL if known, or academic publisher reference" },
                    featured: { type: Type.BOOLEAN, description: "True if this represents the single biggest semiconductor event of the week" },
                    author: { type: Type.STRING, description: "Author of the article" }
                  },
                  required: ["id", "title", "category", "summary", "whyItMatters", "industryImpact", "difficulty", "readingTime", "technologyTags", "company", "publishedDate", "source", "url", "featured", "author"]
                }
              }
            },
            required: ["news"]
          }
        }
      })
    );

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Received empty text output from Gemini model.");
    }

    logger.info("Validating retrieved data model schema...");
    const rawData = JSON.parse(textOutput);
    const validatedData = jsonValidator.validateNews(rawData);

    logger.info("Writing validated dataset to news.json...");
    fileWriter.writeJson("news.json", validatedData);
    logger.success("News generation process completed successfully!");
  } catch (error) {
    logger.error("Semiconductor News generation pipeline failed.", error);
    process.exit(1);
  }
}

generateNews();
