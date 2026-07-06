import crypto from "crypto";
import dotenv from "dotenv";
import { adminDb, default as admin } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const { token, projectId } = req.body;
  if (!token || typeof token !== "string" || !projectId || typeof projectId !== "string") {
    return res.status(400).json({ success: false, error: "Missing token or projectId." });
  }

  try {
    // 1. Verify portal token
    const querySnapshot = await db
      .collection("portfolio_access_requests")
      .where("portalToken", "==", token)
      .where("status", "==", "approved")
      .get();

    if (querySnapshot.empty) {
      return res.status(403).json({ success: false, error: "Unauthorized: Invalid or revoked portal token." });
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    const requestId = docSnap.id;
    const allowedProjects: string[] = data.allowedProjects || [];

    // 2. Validate project authorization
    if (!allowedProjects.includes(projectId)) {
      return res.status(403).json({ success: false, error: "Forbidden: You are not authorized to download this resource." });
    }

    // 3. Generate secure download token
    const downloadToken = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 4. Store download token in Firestore
    await db.collection("download_tokens").add({
      token: downloadToken,
      requestId,
      projectId,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      downloadCount: 0,
      used: false,
      maxDownloads: 5
    });

    return res.status(200).json({
      success: true,
      downloadUrl: `/api/downloads/serve?downloadToken=${downloadToken}`
    });
  } catch (error: any) {
    console.error("[Request Download Error]", error);
    return res.status(500).json({ success: false, error: "Internal error processing download authorization." });
  }
}
