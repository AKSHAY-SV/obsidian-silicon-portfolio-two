import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import sendEmailHandler from "./api/send-email";
import requestActionHandler from "./api/admin/request-action";
import initHandler from "./api/downloads/init";
import requestDownloadHandler from "./api/downloads/request-download";
import serveHandler from "./api/downloads/serve";
import analyticsHandler from "./api/downloads/analytics";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Enable JSON body parsing
app.use(express.json());

// Security: Prevent direct download of engineering resources (intercept zip files in downloads directory)
app.get("/downloads/*.zip", (req, res) => {
  return res.status(403).json({ error: "Access denied. Direct downloads are strictly forbidden. Use the secure Downloads Portal." });
});

app.get("/public/downloads/*.zip", (req, res) => {
  return res.status(403).json({ error: "Access denied. Direct downloads are strictly forbidden. Use the secure Downloads Portal." });
});

// API: Send email endpoint - delegating directly to our Vercel Serverless function
app.post("/api/send-email", sendEmailHandler);

// API: Refactored secure backend-orchestrated action endpoint
app.post("/api/admin/request-action", requestActionHandler);

// API: Downloads Management Endpoints
app.get("/api/downloads/init", initHandler);
app.post("/api/downloads/request-download", requestDownloadHandler);
app.get("/api/downloads/serve", serveHandler);
app.get("/api/downloads/analytics", analyticsHandler);

// Setup dev server / static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Dev Server] Vite middleware integrated successfully.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Prod Server] Static files serving from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] App is listening on port ${PORT} host 0.0.0.0`);
  });
}

bootstrap();
