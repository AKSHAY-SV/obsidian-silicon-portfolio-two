import path from "path";
import dotenv from "dotenv";
import { Readable } from "stream";
import { adminDb, default as admin } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

const PROJECT_FILES: Record<string, string> = {
  "rv32im-rtl-src": "SoC with Custom RISC-V Processor.zip",
  "axi4-crossbar-test": "APB Compliant UART Peripheral with Integrated FSM.zip",
  "uart-rtl-src": "APB Compliant UART Peripheral with Integrated FSM.zip",
  "rv32im-floorplan-def": "RV32IM 5-Stage Pipeline.zip",
  "8-bit-cpu": "8 Bit CPU.zip",
  "8-bit-cpu-rtl-src": "8 Bit CPU.zip",
  "l2-cache-gate-netlist": "Cache Memory.zip",
  "cache-rtl-src": "Cache Memory.zip",
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

    // Validate that missing environment variables produce clear server errors
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_PRIVATE_REPO = process.env.GITHUB_PRIVATE_REPO || "obsidian-private-assets";

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_PRIVATE_REPO) {
      const missingVars = [];
      if (!GITHUB_TOKEN) missingVars.push("GITHUB_TOKEN");
      if (!GITHUB_OWNER) missingVars.push("GITHUB_OWNER");
      if (!GITHUB_PRIVATE_REPO) missingVars.push("GITHUB_PRIVATE_REPO");
      
      console.error(`Missing required GitHub environment configuration: ${missingVars.join(", ")}`);
      return renderErrorPage(
        res,
        500,
        "Server Configuration Error",
        `The server is missing the required GitHub environment configuration: ${missingVars.join(", ")}.`
      );
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

    // 7. Fetch the file from the private GitHub repository via GitHub API
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/zip");

    let response: any;
    try {
      // Path 1: public/downloads/filename
      const url1 = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_PRIVATE_REPO}/contents/public/downloads/${encodeURIComponent(fileName)}`;
      response = await fetch(url1, {
        headers: {
          "Authorization": `token ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3.raw",
          "User-Agent": "Obsidian-Silicon-Portfolio"
        }
      });

      if (response.status === 404) {
        // Path 2: downloads/filename
        const url2 = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_PRIVATE_REPO}/contents/downloads/${encodeURIComponent(fileName)}`;
        response = await fetch(url2, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3.raw",
            "User-Agent": "Obsidian-Silicon-Portfolio"
          }
        });
      }

      if (response.status === 404) {
        // Path 3: root filename
        const url3 = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_PRIVATE_REPO}/contents/${encodeURIComponent(fileName)}`;
        response = await fetch(url3, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3.raw",
            "User-Agent": "Obsidian-Silicon-Portfolio"
          }
        });
      }
    } catch (fetchErr: any) {
      console.error("[GitHub Connection Failed]", fetchErr);
      return renderErrorPage(
        res,
        500,
        "GitHub Integration Error",
        `Failed to establish connection with private repository: ${fetchErr.message || fetchErr}`
      );
    }

    if (!response.ok) {
      console.error(`GitHub API returned error: ${response.status} ${response.statusText}`);
      let errorMessage = `Failed to retrieve the file from the private engineering repository. HTTP Status: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // not JSON
        }
        if (errorData && errorData.message) {
          errorMessage += ` - GitHub Details: ${errorData.message}`;
        } else if (errorText && errorText.length < 200) {
          errorMessage += ` - Details: ${errorText}`;
        }
      } catch (e) {
        // ignore
      }
      return renderErrorPage(
        res,
        response.status === 403 || response.status === 401 ? 403 : 500,
        "Asset Offline",
        errorMessage
      );
    }

    // 8. Stream file contents directly to user using Node streaming
    if (response.body) {
      Readable.fromWeb(response.body as any).pipe(res);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    }

  } catch (error: any) {
    console.error("[Serve Download Error]", error);
    return renderErrorPage(res, 500, "Server Error", `An internal error occurred: ${error.message}`);
  }
}
