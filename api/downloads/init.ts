import dotenv from "dotenv";
import { adminDb } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid token parameter." });
  }

  try {
    const querySnapshot = await db
      .collection("portfolio_access_requests")
      .where("portalToken", "==", token)
      .where("status", "==", "approved")
      .get();

    if (querySnapshot.empty) {
      return res.status(403).json({ success: false, error: "Invalid, expired, or revoked portal access token." });
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return res.status(200).json({
      success: true,
      requestId: docSnap.id,
      name: data.name,
      email: data.email,
      university: data.university,
      allowedProjects: data.allowedProjects || [],
    });
  } catch (error: any) {
    console.error("[Downloads Init Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}
