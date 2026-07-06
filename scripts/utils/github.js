import { execSync } from "child_process";
import { logger } from "./logger.js";

export const github = {
  /**
   * Check if git commands can be executed in the current workspace.
   */
  isGitRepo: () => {
    try {
      execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Fetch any modified or untracked JSON files under public/data.
   */
  getChangedFiles: () => {
    try {
      const output = execSync("git status --porcelain public/data/", { encoding: "utf8" });
      return output
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.split(/\s+/)[1]);
    } catch (error) {
      logger.error("Failed to fetch changed files via Git.", error);
      return [];
    }
  }
};
