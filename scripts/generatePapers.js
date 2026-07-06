import { Type } from "@google/genai";
import { getGeminiClient } from "./utils/geminiClient.js";
import { promptBuilder } from "./utils/promptBuilder.js";
import { jsonValidator } from "./utils/jsonValidator.js";
import { fileWriter } from "./utils/fileWriter.js";
import { logger } from "./utils/logger.js";
import { withRetry } from "./utils/retry.js";

async function generatePapers() {
  logger.info("Starting autonomous Research Papers generator...");
  try {
    const ai = getGeminiClient();
    const currentDate = new Date().toISOString().split("T")[0];
    const prompt = promptBuilder.buildPapersPrompt(currentDate);

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
              papers: {
                type: Type.ARRAY,
                description: "List of real semiconductor research papers and publications.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique identifier (e.g. paper-1, paper-2)" },
                    title: { type: Type.STRING, description: "Academic and technical title of the research paper" },
                    authors: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "List of primary researchers"
                    },
                    conference: { type: Type.STRING, description: "Conference or Symposium presented, e.g., ISSCC, DAC, VLSI Symposium" },
                    publication: { type: Type.STRING, description: "Academic publisher or journal name, e.g., IEEE Explore, Nature Electronics" },
                    summary: { type: Type.STRING, description: "Deeply technical, scientific summary of the semiconductor microarchitecture" },
                    applications: { type: Type.STRING, description: "Practical engineering applications of the silicon layouts or logic gates" },
                    industryRelevance: { type: Type.STRING, description: "Significance of research to industrial cell design and microprocessors" },
                    difficulty: { type: Type.STRING, description: "Expertise required: Intermediate, Advanced, or Expert" },
                    keywords: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Scientific indexing keywords, e.g., ['RRAM Crossbar', 'Analog dot-product', 'Neuromorphic']"
                    },
                    publishedDate: { type: Type.STRING, description: "Date published in YYYY-MM-DD" },
                    url: { type: Type.STRING, description: "Academic DOI index link or repository page" },
                    estimatedReadingTime: { type: Type.STRING, description: "Estimated reading duration, e.g., '10 min read'" }
                  },
                  required: ["id", "title", "authors", "conference", "publication", "summary", "applications", "industryRelevance", "difficulty", "keywords", "publishedDate", "url", "estimatedReadingTime"]
                }
              }
            },
            required: ["papers"]
          }
        }
      })
    );

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Received empty text output from Gemini model.");
    }

    logger.info("Validating retrieved paper dataset schema...");
    const rawData = JSON.parse(textOutput);
    const validatedData = jsonValidator.validatePapers(rawData);

    logger.info("Writing validated dataset to papers.json...");
    fileWriter.writeJson("papers.json", validatedData);
    logger.success("Research papers generation process completed successfully!");
  } catch (error) {
    logger.error("Semiconductor Research Papers generation pipeline failed.", error);
    process.exit(1);
  }
}

generatePapers();
