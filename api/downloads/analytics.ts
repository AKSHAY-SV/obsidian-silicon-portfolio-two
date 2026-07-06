import dotenv from "dotenv";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: Missing Authorization header." });
  }

  const token = authHeader.substring(7);
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid token format." });
  }

  let decodedToken: any;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error: any) {
    console.error("[Analytics Auth Error]", error);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired administrator token." });
  }

  const adminEmail = decodedToken.email?.toLowerCase();
  if (adminEmail !== "crazyplayz61@gmail.com") {
    return res.status(403).json({ success: false, error: "Forbidden: Unauthorized administrator email." });
  }

  try {
    const querySnapshot = await db.collection("download_logs").orderBy("downloadTime", "desc").get();

    const logs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      let downloadTimeFormatted = "—";
      let downloadTimeMs = 0;
      if (d.downloadTime) {
        const date = d.downloadTime.toDate ? d.downloadTime.toDate() : new Date(d.downloadTime);
        downloadTimeFormatted = date.toLocaleString();
        downloadTimeMs = date.getTime();
      }

      logs.push({
        id: docSnap.id,
        requestId: d.requestId || "—",
        email: d.email || "—",
        university: d.university || "—",
        project: d.project || "—",
        downloadTime: downloadTimeFormatted,
        downloadTimeMs,
        downloadIP: d.downloadIP || "—",
        browser: d.browser || "—",
        token: d.token ? `${d.token.substring(0, 8)}...` : "—",
        result: d.result || "—"
      });
    });

    const totalDownloads = logs.length;
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (now.getDay() * oneDay);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let downloadsToday = 0;
    let downloadsThisWeek = 0;
    let downloadsThisMonth = 0;

    const projectCounts: Record<string, number> = {};
    const universityCounts: Record<string, number> = {};

    logs.forEach(log => {
      if (log.result === "success") {
        if (log.downloadTimeMs >= startOfToday) downloadsToday++;
        if (log.downloadTimeMs >= startOfWeek) downloadsThisWeek++;
        if (log.downloadTimeMs >= startOfMonth) downloadsThisMonth++;

        projectCounts[log.project] = (projectCounts[log.project] || 0) + 1;
        if (log.university && log.university !== "—" && log.university !== "Unknown University") {
          universityCounts[log.university] = (universityCounts[log.university] || 0) + 1;
        }
      }
    });

    let mostDownloadedProject = "—";
    let maxProjCount = 0;
    for (const [p, count] of Object.entries(projectCounts)) {
      if (count > maxProjCount) {
        maxProjCount = count;
        mostDownloadedProject = p;
      }
    }
    if (mostDownloadedProject !== "—") {
      mostDownloadedProject = `${mostDownloadedProject} (${maxProjCount} downloads)`;
    }

    let mostActiveUniversity = "—";
    let maxUnivCount = 0;
    for (const [u, count] of Object.entries(universityCounts)) {
      if (count > maxUnivCount) {
        maxUnivCount = count;
        mostActiveUniversity = u;
      }
    }
    if (mostActiveUniversity !== "—") {
      mostActiveUniversity = `${mostActiveUniversity} (${maxUnivCount} times)`;
    }

    let newestDownload = "None";
    const newestSuccess = logs.find(log => log.result === "success");
    if (newestSuccess) {
      newestDownload = `${newestSuccess.email} (${newestSuccess.project})`;
    }

    return res.status(200).json({
      success: true,
      logs,
      metrics: {
        totalDownloads,
        downloadsToday,
        downloadsThisWeek,
        downloadsThisMonth,
        mostDownloadedProject,
        mostActiveUniversity,
        newestDownload
      }
    });

  } catch (error: any) {
    console.error("[Downloads Analytics Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}
