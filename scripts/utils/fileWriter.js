import fs from "fs";
import path from "path";
import { logger } from "./logger.js";

export const fileWriter = {
  writeJson: (fileName, data) => {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const targetDir = path.join(publicDir, "data");

      // Ensure directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, fileName);

      // Deep validate to ensure we have a valid object and it's not empty
      if (!data || Object.keys(data).length === 0) {
        throw new Error("Refusing to write empty object to " + fileName);
      }

      const jsonString = JSON.stringify(data, null, 2);
      
      // Perform write
      fs.writeFileSync(filePath, jsonString, "utf8");
      logger.success(`Successfully wrote data to: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } catch (error) {
      logger.error(`Failed writing to ${fileName}. Keeping previous files intact.`, error);
      return false;
    }
  }
};
