import { logger } from "./logger.js";

export const validator = {
  /**
   * Check for duplicate values in an array of objects by specified key.
   */
  hasDuplicateKey: (array, keyName) => {
    const seen = new Set();
    for (const obj of array) {
      const val = obj[keyName];
      if (val) {
        const normalized = String(val).toLowerCase().trim();
        if (seen.has(normalized)) {
          logger.warn(`Duplicate found for field '${keyName}': "${val}"`);
          return true;
        }
        seen.add(normalized);
      }
    }
    return false;
  },

  /**
   * Verify all mandatory properties exist on the object
   */
  hasRequiredFields: (obj, fields) => {
    for (const field of fields) {
      if (obj[field] === undefined || obj[field] === null || String(obj[field]).trim() === "") {
        logger.warn(`Missing required field: '${field}' in object ${JSON.stringify(obj).substring(0, 120)}...`);
        return false;
      }
    }
    return true;
  }
};
