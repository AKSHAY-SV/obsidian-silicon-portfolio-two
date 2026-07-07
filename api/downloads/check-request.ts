import dotenv from "dotenv";
import { adminDb } from "../../lib/firebaseAdmin";

dotenv.config();

const db = adminDb;

/**
 * Secure Backend API to check access request status by email.
 * This endpoint replaces the insecure client-side query, preventing the exposure of sensitive fields
 * like 'portalToken', 'purpose', or 'university' to anonymous queries.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid email parameter." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const querySnapshot = await db
      .collection("portfolio_access_requests")
      .where("email", "==", normalizedEmail)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(200).json({
        success: true,
        request: null
      });
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    // EXTREMELY IMPORTANT: Return only a safe, minimal subset of request data.
    // Do NOT return the sensitive 'portalToken', 'purpose', or any other internal details.
    return res.status(200).json({
      success: true,
      request: {
        id: docSnap.id,
        email: data.email,
        status: data.status
      }
    });
  } catch (error: any) {
    console.error("[Check Request Status Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}
