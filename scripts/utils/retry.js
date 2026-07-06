import { logger } from "./logger.js";

/**
 * Executes a function with exponential backoff retry.
 * @param {Function} fn - The asynchronous function to execute.
 * @param {number} maxRetries - Maximum number of retries.
 * @param {number} delayMs - Base delay in milliseconds.
 */
export async function withRetry(fn, maxRetries = 3, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      logger.warn(`API execution failed (attempt ${attempt}/${maxRetries}). Error: ${error.message || error}`);
      if (attempt >= maxRetries) {
        throw error;
      }
      const backoff = delayMs * Math.pow(2, attempt - 1);
      logger.info(`Sleeping for ${backoff}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}
