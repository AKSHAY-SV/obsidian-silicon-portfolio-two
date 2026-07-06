import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

const CACHE_DIR = path.join(process.cwd(), "logs", "cache");

export const cache = {
  /**
   * Save an item to local cache
   */
  set: (key, value) => {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
    } catch (error) {
      logger.warn(`Failed to write to cache for key '${key}': ${error.message}`);
    }
  },

  /**
   * Read item from local cache
   */
  get: (key) => {
    try {
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
    } catch (error) {
      logger.warn(`Failed to read from cache for key '${key}': ${error.message}`);
    }
    return null;
  },

  /**
   * Clear all cached files
   */
  clear: () => {
    try {
      if (fs.existsSync(CACHE_DIR)) {
        const files = fs.readdirSync(CACHE_DIR);
        for (const file of files) {
          fs.unlinkSync(path.join(CACHE_DIR, file));
        }
        logger.info("Temporary cache directories cleared successfully.");
      }
    } catch (error) {
      logger.error("Failed to clear local cache files.", error);
    }
  }
};
