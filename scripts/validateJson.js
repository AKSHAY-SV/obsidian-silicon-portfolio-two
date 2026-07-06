import fs from "fs";
import path from "path";
import { logger } from "./utils/logger.js";
import { validator } from "./utils/validator.js";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const LOG_DIR = path.join(process.cwd(), "logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const validationLogPath = path.join(LOG_DIR, "validation.log");

function appendToLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(validationLogPath, `[${timestamp}] ${message}\n`, "utf8");
}

function runValidation() {
  logger.info("Initializing comprehensive JSON verification...");
  appendToLog("Starting dynamic verification routine.");

  try {
    const newsPath = path.join(DATA_DIR, "news.json");
    const papersPath = path.join(DATA_DIR, "papers.json");
    const trendingPath = path.join(DATA_DIR, "trending.json");

    // 1. Check existence of all critical files
    const filesToCheck = [
      { name: "news.json", path: newsPath },
      { name: "papers.json", path: papersPath },
      { name: "trending.json", path: trendingPath }
    ];

    for (const f of filesToCheck) {
      if (!fs.existsSync(f.path)) {
        throw new Error(`CRITICAL: Required data file missing: ${f.name}`);
      }
    }

    // 2. Validate news.json
    const newsRaw = fs.readFileSync(newsPath, "utf8");
    const newsData = JSON.parse(newsRaw);

    if (!newsData.news || !Array.isArray(newsData.news) || newsData.news.length === 0) {
      throw new Error("news.json cannot be empty and must contain an array of 'news' items.");
    }

    const newsFields = ["id", "title", "category", "summary", "whyItMatters", "industryImpact", "difficulty", "readingTime", "publishedDate", "source", "url"];
    for (const item of newsData.news) {
      if (!validator.hasRequiredFields(item, newsFields)) {
        throw new Error(`Malformed news entry found: ${JSON.stringify(item).substring(0, 100)}...`);
      }
    }

    if (validator.hasDuplicateKey(newsData.news, "id")) {
      throw new Error("Duplicate news ID detected.");
    }
    if (validator.hasDuplicateKey(newsData.news, "title")) {
      throw new Error("Duplicate news title detected.");
    }
    // Filter non-generic URLs for duplicate checks
    const activeNewsUrls = newsData.news.filter(n => n.url && !n.url.includes("ieee.org") && n.url !== "#");
    if (validator.hasDuplicateKey(activeNewsUrls, "url")) {
      throw new Error("Duplicate news URL detected among active sources.");
    }

    // 3. Validate papers.json
    const papersRaw = fs.readFileSync(papersPath, "utf8");
    const papersData = JSON.parse(papersRaw);

    if (!papersData.papers || !Array.isArray(papersData.papers) || papersData.papers.length === 0) {
      throw new Error("papers.json cannot be empty and must contain an array of 'papers' items.");
    }

    const paperFields = ["id", "title", "authors", "summary", "applications", "industryRelevance", "difficulty", "url", "estimatedReadingTime", "publishedDate"];
    for (const item of papersData.papers) {
      if (!validator.hasRequiredFields(item, paperFields)) {
        throw new Error(`Malformed research paper entry found: ${JSON.stringify(item).substring(0, 100)}...`);
      }
    }

    if (validator.hasDuplicateKey(papersData.papers, "id")) {
      throw new Error("Duplicate paper ID detected.");
    }
    if (validator.hasDuplicateKey(papersData.papers, "title")) {
      throw new Error("Duplicate paper title detected.");
    }
    const activePaperUrls = papersData.papers.filter(p => p.url && !p.url.includes("ieee.org") && p.url !== "#");
    if (validator.hasDuplicateKey(activePaperUrls, "url")) {
      throw new Error("Duplicate paper URL detected.");
    }

    // 4. Validate trending.json
    const trendingRaw = fs.readFileSync(trendingPath, "utf8");
    const trendingData = JSON.parse(trendingRaw);

    if (!trendingData.technologies || !Array.isArray(trendingData.technologies) || trendingData.technologies.length === 0) {
      throw new Error("trending.json must have at least one active technology node.");
    }
    if (!trendingData.weeklyDigest || !trendingData.weeklyDigest.editorial || !trendingData.weeklyDigest.focus) {
      throw new Error("trending.json lacks a valid weekly digest block.");
    }
    if (!trendingData.statistics || !trendingData.statistics.latestUpdate) {
      throw new Error("trending.json lacks valid statistical metadata.");
    }

    logger.success("All data validations PASSED successfully.");
    appendToLog("SUCCESS: All target JSON files passed validation checks.");
  } catch (error) {
    logger.error("JSON schema validation FAILED.", error);
    appendToLog(`FAILURE: ${error.message}`);
    process.exit(1);
  }
}

runValidation();
