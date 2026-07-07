import fs from "fs";
import path from "path";

const ALLOWED_PROJECT_SLUGS = ["5-stage-pipeline-riscv", "rv32im-soc-processor", "uart", "cache-memory", "8-bit-cpu"];

const LOGICAL_KEYS = [
  "simulation",
  "synthesis",
  "timing",
  "layout",
  "floorplan",
  "gds",
  "gdsii",
  "rtl",
  "block-diagram",
  "documentation",
  "downloads"
];

// Map a logical frontend key to physical disk folder names to scan
const KEY_TO_DISK_FOLDERS: Record<string, string[]> = {
  simulation: ["waveforms", "simulation"],
  synthesis: ["synthesis"],
  timing: ["timing"],
  layout: ["gdsii", "gds", "layout"],
  floorplan: ["floorplan"],
  gds: ["gdsii", "gds", "layout"],
  gdsii: ["gdsii", "gds", "layout"],
  rtl: ["rtl"],
  "block-diagram": ["block-diagram", "diagram"],
  documentation: ["documentation", "docs"],
  downloads: ["downloads"]
};

const SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf", ".zip", ".v", ".sv", ".chisel"];

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const { project } = req.query;

  if (!project || typeof project !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid 'project' parameter." });
  }

  if (!ALLOWED_PROJECT_SLUGS.includes(project)) {
    return res.status(400).json({ success: false, error: `Invalid project slug. Allowed: ${ALLOWED_PROJECT_SLUGS.join(", ")}` });
  }

  try {
    const scanTargets: Array<{ dirPath: string; servingPrefix: string }> = [];

    // Always scan public/projects/<project>
    scanTargets.push({
      dirPath: path.join(process.cwd(), "public", "projects", project),
      servingPrefix: project
    });

    // Special mapping: 5-stage-pipeline-riscv -> rv32im-soc-processor
    if (project === "5-stage-pipeline-riscv") {
      scanTargets.push({
        dirPath: path.join(process.cwd(), "public", "projects", "rv32im-soc-processor"),
        servingPrefix: "rv32im-soc-processor"
      });
    }

    const assetsMap: Record<string, Array<{ name: string; url: string; size: string }>> = {};

    // Initialize map
    for (const key of LOGICAL_KEYS) {
      assetsMap[key] = [];
    }

    // Scan each target directory
    for (const target of scanTargets) {
      if (!fs.existsSync(target.dirPath)) continue;

      // 1. Scan logical subdirectories
      for (const logicalKey of LOGICAL_KEYS) {
        const diskFolders = KEY_TO_DISK_FOLDERS[logicalKey] || [logicalKey];

        for (const diskSubdir of diskFolders) {
          const subdirPath = path.join(target.dirPath, diskSubdir);

          if (fs.existsSync(subdirPath)) {
            const files = await fs.promises.readdir(subdirPath);

            for (const file of files) {
              const ext = path.extname(file).toLowerCase();
              if (SUPPORTED_EXTENSIONS.includes(ext)) {
                const filePath = path.join(subdirPath, file);
                const stats = await fs.promises.stat(filePath);

                // Skip directories if any
                if (stats.isDirectory()) continue;
                
                // Format size
                const sizeInBytes = stats.size;
                let sizeStr = `${sizeInBytes} B`;
                if (sizeInBytes >= 1024 * 1024) {
                  sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
                } else if (sizeInBytes >= 1024) {
                  sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
                }

                // Avoid duplicates if same filename is already added under this logicalKey
                if (assetsMap[logicalKey].some(item => item.name === file)) continue;

                assetsMap[logicalKey].push({
                  name: file,
                  url: `/assets/projects/${target.servingPrefix}/${diskSubdir}/${file}`,
                  size: sizeStr
                });
              }
            }
          }
        }
      }

      // 2. Scan project root directory for block diagrams specifically
      const rootFiles = await fs.promises.readdir(target.dirPath);
      for (const file of rootFiles) {
        const lowerFile = file.toLowerCase();
        if (lowerFile.includes("block-diagram") || lowerFile.includes("block_diagram") || lowerFile.includes("diagram")) {
          const ext = path.extname(file).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            const filePath = path.join(target.dirPath, file);
            const stats = await fs.promises.stat(filePath);
            if (stats.isFile()) {
              const sizeInBytes = stats.size;
              let sizeStr = `${sizeInBytes} B`;
              if (sizeInBytes >= 1024 * 1024) {
                sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
              } else if (sizeInBytes >= 1024) {
                sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
              }

              if (!assetsMap["block-diagram"].some(item => item.name === file)) {
                assetsMap["block-diagram"].push({
                  name: file,
                  url: `/assets/projects/${target.servingPrefix}/${file}`,
                  size: sizeStr
                });
              }
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      project,
      assets: assetsMap
    });

  } catch (error: any) {
    console.error("[Project Assets Discovery Error]", error);
    return res.status(500).json({ success: false, error: "Internal server error scanning project directory." });
  }
}
