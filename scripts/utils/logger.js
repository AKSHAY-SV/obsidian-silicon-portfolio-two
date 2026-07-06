export const logger = {
  info: (message) => {
    console.log(`\x1b[34m[INFO]\x1b[0m ${message}`);
  },
  warn: (message) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
  },
  error: (message, error) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, error || '');
  },
  success: (message) => {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
  }
};
