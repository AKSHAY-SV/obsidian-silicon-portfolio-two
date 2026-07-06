import fs from "fs";
import path from "path";

const ALLOWED_PROJECT_SLUGS = ["5-stage-pipeline-riscv", "5-stage-soc"];
const SUB_DIRECTORIES = [
  "simulation",
  "synthesis",
  "timing",
  "layout",
  "floorplan",
  "gds",
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
    const projectPath = path.join(process.cwd(), project);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ success: false, error: `Project directory ${project} not found on server.` });
    }

    const assetsMap: Record<string, Array<{ name: string; url: string; size: string }>> = {};

    for (const subdir of SUB_DIRECTORIES) {
      assetsMap[subdir] = [];
      const subdirPath = path.join(projectPath, subdir);

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

            assetsMap[subdir].push({
              name: file,
              url: `/assets/projects/${project}/${subdir}/${file}`,
              size: sizeStr
            });
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
