import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { adminDb, default as admin } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

const PROJECT_FILES: Record<string, string> = {
  "rv32im-rtl-src": "SoC with Custom RISC-V Processor.zip",
  "axi4-crossbar-test": "APB Compliant UART Peripheral with Integrated FSM.zip",
  "rv32im-floorplan-def": "RV32IM 5-Stage Pipeline.zip",
  "8-bit-cpu": "8 Bit CPU.zip",
  "l2-cache-gate-netlist": "Cache Memory.zip",
};

// Beautiful dark glassmorphism HTML error page
function renderErrorPage(res: any, status: number, title: string, message: string) {
  res.status(status).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Secure Download Locker</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
      </style>
    </head>
    <body class="bg-[#0a0a0c] text-slate-100 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Ambient background glow -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-red-900/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div class="relative max-w-md w-full border border-[rgba(255,255,255,0.08)] bg-[#121214]/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/80 text-center">
        <div class="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <span class="mono text-[10px] font-bold uppercase tracking-widest text-red-400 block mb-2">
          ⚠️ Security Guard Alert
        </span>

        <h1 class="text-2xl font-extrabold text-white tracking-tight mb-3">
          ${title}
        </h1>

        <p class="text-slate-400 text-sm leading-relaxed mb-6">
          ${message}
        </p>

        <div class="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col gap-3">
          <a href="/downloads" class="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-3 font-semibold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/15">
            Return to Download Center
          </a>
          <span class="mono text-[8px] text-slate-600">
            OBSIDIAN ARCHITECTURE SECURITY ENFORCEMENT
          </span>
        </div>
      </div>
    </body>
    </html>
  `);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const { downloadToken } = req.query;
  if (!downloadToken || typeof downloadToken !== "string") {
    return renderErrorPage(res, 400, "Invalid Link", "The download URL parameter is missing or improperly formed.");
  }

  const userIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
  const userAgent = req.headers["user-agent"] || "Unknown Browser";

  try {
    // 1. Find the download token
    const querySnapshot = await db
      .collection("download_tokens")
      .where("token", "==", downloadToken)
      .get();

    if (querySnapshot.empty) {
      return renderErrorPage(res, 403, "Access Forbidden", "The specified token does not exist, has expired, or has been revoked.");
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();
    const tokenDocRef = db.collection("download_tokens").doc(tokenDoc.id);

    const { requestId, projectId, expiresAt, downloadCount, used, maxDownloads } = tokenData;

    // 2. Validate token rules
    const now = admin.firestore.Timestamp.now();
    const isExpired = expiresAt && now.seconds > expiresAt.seconds;
    const isLimitReached = downloadCount >= (maxDownloads || 5);

    if (isExpired || used || isLimitReached) {
      // Mark as used in DB if it wasn't already
      if (!used) {
        await tokenDocRef.update({ used: true });
      }
      // Create a failure audit log
      try {
        const reqDocRef = db.collection("portfolio_access_requests").doc(requestId);
        const reqDocSnap = await reqDocRef.get();
        const reqData = reqDocSnap.exists ? reqDocSnap.data() : {};
        const email = reqData?.email || "unknown@user.com";
        const university = reqData?.university || "Unknown University";

        await db.collection("download_logs").add({
          requestId,
          email,
          university,
          project: PROJECT_FILES[projectId] || projectId,
          downloadTime: admin.firestore.FieldValue.serverTimestamp(),
          downloadIP: userIP,
          browser: userAgent,
          token: downloadToken,
          result: "failed"
        });
      } catch (logErr) {
        console.error("Failed to write failed download log", logErr);
      }

      return renderErrorPage(res, 403, "Access Expired", "This download token has expired, or exceeded the maximum limit of 5 downloads.");
    }

    // 3. Resolve file and verify existence
    const fileName = PROJECT_FILES[projectId];
    if (!fileName) {
      return renderErrorPage(res, 404, "Resource Missing", "The requested project asset is not configured or could not be found.");
    }

    const filePath = path.join(process.cwd(), "public", "downloads", fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found on disk: ${filePath}`);
      return renderErrorPage(res, 404, "Asset Offline", "The file is physically missing from our engineering directory.");
    }

    // 4. Update the token usage count
    const nextCount = (downloadCount || 0) + 1;
    await tokenDocRef.update({
      downloadCount: nextCount,
      used: nextCount >= (maxDownloads || 5)
    });

    // 5. Fetch user request details for clean audit log
    let email = "unknown@user.com";
    let university = "Unknown University";
    try {
      const reqDocRef = db.collection("portfolio_access_requests").doc(requestId);
      const reqDocSnap = await reqDocRef.get();
      if (reqDocSnap.exists) {
        const rData = reqDocSnap.data();
        email = rData?.email || email;
        university = rData?.university || university;
      }
    } catch (dbErr) {
      console.warn("Could not retrieve request details for audit logging", dbErr);
    }

    // 6. Log the successful download
    await db.collection("download_logs").add({
      requestId,
      email,
      university,
      project: fileName,
      downloadTime: admin.firestore.FieldValue.serverTimestamp(),
      downloadIP: userIP,
      browser: userAgent,
      token: downloadToken,
      result: "success"
    });

    // 7. Stream the file directly
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/zip");
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (err) => {
      console.error("Stream pipe error:", err);
      if (!res.headersSent) {
        return renderErrorPage(res, 500, "Streaming Failure", "A server error occurred while transferring files.");
      }
    });

    fileStream.pipe(res);

  } catch (error: any) {
    console.error("[Serve Download Error]", error);
    return renderErrorPage(res, 500, "Server Error", `An internal error occurred: ${error.message}`);
  }
}
