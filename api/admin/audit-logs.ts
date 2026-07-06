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
    console.error("[Audit Logs Auth Error]", error);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired administrator token." });
  }

  const adminEmail = decodedToken.email?.toLowerCase();
  if (adminEmail !== "crazyplayz61@gmail.com") {
    return res.status(403).json({ success: false, error: "Forbidden: Unauthorized administrator email." });
  }

  try {
    const querySnapshot = await db.collection("admin_audit_logs").orderBy("timestamp", "desc").get();

    const logs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      let timestampFormatted = "—";
      let timestampMs = 0;
      if (d.timestamp) {
        const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
        timestampFormatted = date.toLocaleString();
        timestampMs = date.getTime();
      }

      logs.push({
        id: docSnap.id,
        timestamp: timestampFormatted,
        timestampMs,
        administratorEmail: d.administratorEmail || "—",
        requestId: d.requestId || "—",
        action: d.action || "—",
        result: d.result || "—",
        emailFailed: !!d.emailFailed,
        emailErrorMessage: d.emailErrorMessage || null,
        ipAddress: d.ipAddress || "—"
      });
    });

    return res.status(200).json({
      success: true,
      logs
    });

  } catch (error: any) {
    console.error("[Admin Audit Logs Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}
