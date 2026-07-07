import fs from "fs";
import path from "path";

const ALLOWED_PROJECT_SLUGS = ["5-stage-pipeline-riscv", "5-stage-soc", "rv32im-soc-processor", "uart", "cache-memory", "8-bit-cpu"];
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
    // Define all directories to scan for this request
    const scanTargets: Array<{ dirPath: string; servingPrefix: string }> = [];

    if (project === "rv32im-soc-processor") {
      scanTargets.push({
        dirPath: path.join(process.cwd(), "public", "projects", "rv32im-soc-processor"),
        servingPrefix: "rv32im-soc-processor"
      });
    } else if (project === "5-stage-soc") {
      scanTargets.push({
        dirPath: path.join(process.cwd(), "5-stage-soc"),
        servingPrefix: "5-stage-soc"
      });
    } else if (project === "uart" || project === "cache-memory" || project === "8-bit-cpu") {
      scanTargets.push({
        dirPath: path.join(process.cwd(), "public", "projects", project),
        servingPrefix: project
      });
    } else {
      scanTargets.push({
        dirPath: path.join(process.cwd(), project),
        servingPrefix: project
      });
    }

    const assetsMap: Record<string, Array<{ name: string; url: string; size: string }>> = {};

    // Initialize map
    for (const subdir of SUB_DIRECTORIES) {
      assetsMap[subdir] = [];
    }

    // Scan each target directory
    for (const target of scanTargets) {
      if (!fs.existsSync(target.dirPath)) continue;

      for (const subdir of SUB_DIRECTORIES) {
        // Map asset category to actual disk directory name
        let diskSubdir = subdir;
        if (subdir === "simulation" && (target.servingPrefix === "rv32im-soc-processor" || target.servingPrefix === "uart" || target.servingPrefix === "cache-memory" || target.servingPrefix === "8-bit-cpu")) {
          diskSubdir = "waveforms";
        }

        const subdirPath = path.join(target.dirPath, diskSubdir);

        if (fs.existsSync(subdirPath)) {
          const files = await fs.promises.readdir(subdirPath);

          for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
              const filePath = path.join(subdirPath, file);
              const stats = await fs.promises.stat(filePath);
              
              // Format size
              const sizeInBytes = stats.size;
              let sizeStr = `${sizeInBytes} B`;
              if (sizeInBytes >= 1024 * 1024) {
                sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
              } else if (sizeInBytes >= 1024) {
                sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
              }

              // Avoid duplicates if same filename is already added under this subdir
              if (assetsMap[subdir].some(item => item.name === file)) continue;

              assetsMap[subdir].push({
                name: file,
                url: `/assets/projects/${target.servingPrefix}/${diskSubdir}/${file}`,
                size: sizeStr
              });
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
