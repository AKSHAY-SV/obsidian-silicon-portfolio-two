import { logger } from "./logger.js";

export const jsonUtils = {
  /**
   * Safely parses JSON with fallback support.
   */
  safeParse: (text, fallback = null) => {
    try {
      return JSON.parse(text);
    } catch (error) {
      logger.error("JSON parsing failed, falling back to safe defaults.", error);
      return fallback;
    }
  },

  /**
   * Strips potential markdown block surrounds from AI response.
   */
  stripMarkdown: (text) => {
    if (!text) return "";
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    return cleaned.trim();
  }
};
