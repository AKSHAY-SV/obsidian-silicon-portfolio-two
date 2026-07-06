import fs from "fs";
import path from "path";
import { logger } from "./utils/logger.js";
import { cache } from "./utils/cache.js";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function cleanNews() {
  const newsPath = path.join(DATA_DIR, "news.json");
  if (!fs.existsSync(newsPath)) return;

  logger.info("Initiating news feed deduplication & cleanup...");
  try {
    const raw = fs.readFileSync(newsPath, "utf8");
    const data = JSON.parse(raw);
    if (!data.news || !Array.isArray(data.news)) return;

    const seenIds = new Set();
    const seenTitles = new Set();
    const cleanedList = [];

    for (const item of data.news) {
      const id = String(item.id || "").trim();
      const title = String(item.title || "").trim().toLowerCase();

      if (!id || !title) {
        logger.warn(`Pruned empty/malformed news item: ${JSON.stringify(item)}`);
        continue;
      }

      if (seenIds.has(id)) {
        logger.warn(`Pruned duplicated news item by ID: "${id}"`);
        continue;
      }
      if (seenTitles.has(title)) {
        logger.warn(`Pruned duplicated news item by title: "${item.title}"`);
        continue;
      }

      seenIds.add(id);
      seenTitles.add(title);
      cleanedList.push(item);
    }

    // Ensure at least one is featured
    if (cleanedList.length > 0 && !cleanedList.some(item => item.featured)) {
      cleanedList[0].featured = true;
    }

    data.news = cleanedList;
    fs.writeFileSync(newsPath, JSON.stringify(data, null, 2), "utf8");
    logger.success(`Cleaned news.json. Retained ${cleanedList.length} unique articles.`);
  } catch (error) {
    logger.error("Error cleaning up news.json", error);
  }
}

function cleanPapers() {
  const papersPath = path.join(DATA_DIR, "papers.json");
  if (!fs.existsSync(papersPath)) return;

  logger.info("Initiating research papers deduplication & cleanup...");
  try {
    const raw = fs.readFileSync(papersPath, "utf8");
    const data = JSON.parse(raw);
    if (!data.papers || !Array.isArray(data.papers)) return;

    const seenIds = new Set();
    const seenTitles = new Set();
    const cleanedList = [];

    for (const item of data.papers) {
      const id = String(item.id || "").trim();
      const title = String(item.title || "").trim().toLowerCase();

      if (!id || !title) {
        logger.warn(`Pruned empty/malformed paper: ${JSON.stringify(item)}`);
        continue;
      }

      if (seenIds.has(id)) {
        logger.warn(`Pruned duplicated paper by ID: "${id}"`);
        continue;
      }
      if (seenTitles.has(title)) {
        logger.warn(`Pruned duplicated paper by title: "${item.title}"`);
        continue;
      }

      seenIds.add(id);
      seenTitles.add(title);
      cleanedList.push(item);
    }

    data.papers = cleanedList;
    fs.writeFileSync(papersPath, JSON.stringify(data, null, 2), "utf8");
    logger.success(`Cleaned papers.json. Retained ${cleanedList.length} unique publications.`);
  } catch (error) {
    logger.error("Error cleaning up papers.json", error);
  }
}

function runCleanup() {
  cleanNews();
  cleanPapers();
  
  logger.info("Clearing temporary cache directory files...");
  cache.clear();
  
  logger.success("All automated cleanup procedures completed successfully.");
}

runCleanup();
