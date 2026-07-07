import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname if needed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT_DIR, "public", "projects");
const OUTPUT_FILE = path.join(PROJECTS_DIR, "assets-manifest.json");

const SUB_DIRECTORIES = [
  "simulation",
  "synthesis",
  "timing",
  "layout",
  "floorplan",
  "gds",
  "gdsii",
  "rtl",
  "block-diagram",
  "documentation"
];

const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".pdf"];

async function run() {
  console.log("[Asset Manifest] Starting static scan of project assets...");

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.warn(`[Asset Manifest] Projects directory not found at: ${PROJECTS_DIR}`);
    return;
  }

  const manifest = {};

  try {
    const projectDirs = await fs.promises.readdir(PROJECTS_DIR);

    for (const projectSlug of projectDirs) {
      const projectPath = path.join(PROJECTS_DIR, projectSlug);
      const stat = await fs.promises.stat(projectPath);

      if (!stat.isDirectory()) continue;

      const assetsMap = {};
      for (const subdir of SUB_DIRECTORIES) {
        assetsMap[subdir] = [];
      }

      for (const subdir of SUB_DIRECTORIES) {
        let diskSubdir = subdir;
        if (subdir === "simulation" && projectSlug === "rv32im-soc-processor") {
          diskSubdir = "waveforms";
        }

        const subdirPath = path.join(projectPath, diskSubdir);

        if (fs.existsSync(subdirPath)) {
          const files = await fs.promises.readdir(subdirPath);

          for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
              const filePath = path.join(subdirPath, file);
              const stats = await fs.promises.stat(filePath);

              const sizeInBytes = stats.size;
              let sizeStr = `${sizeInBytes} B`;
              if (sizeInBytes >= 1024 * 1024) {
                sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
              } else if (sizeInBytes >= 1024) {
                sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
              }

              // Build URL relative to /projects/
              const url = `/projects/${projectSlug}/${diskSubdir}/${file}`;

              assetsMap[subdir].push({
                name: file,
                url: url,
                size: sizeStr
              });
            }
          }
        }
      }

      manifest[projectSlug] = assetsMap;
    }

    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`[Asset Manifest] Successfully wrote static manifest to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("[Asset Manifest] Error generating manifest:", error);
  }
}

run();
