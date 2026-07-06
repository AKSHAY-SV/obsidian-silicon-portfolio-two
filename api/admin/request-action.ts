import crypto from "crypto";
import nodemailer from "nodemailer";
import { adminAuth, adminDb, FieldValue } from "../../lib/firebaseAdmin";

// In-memory sliding window rate limiter for security
const rateLimitStore = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15; // Slightly higher limit for administrative updates

const db = adminDb;

/**
 * Secure Backend API for Administrator request-action (approval/rejection)
 */
export default async function handler(req: any, res: any) {
  // Ensure only POST requests are allowed
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use POST.`
    });
  }

  // --- STEP 1: Verify Administrator Authentication ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Missing or malformed Authorization header."
    });
  }

  const token = authHeader.substring(7);

let decodedToken;

try {
    decodedToken = await adminAuth.verifyIdToken(token);
} catch (err) {
    return res.status(401).json({
        success: false,
        error: "Invalid administrator token."
    });
}

const REQUIRED_ADMIN = "crazyplayz61@gmail.com";

if (
    !decodedToken.email ||
    decodedToken.email.toLowerCase() !== REQUIRED_ADMIN
) {
    return res.status(403).json({
        success: false,
        error: "Administrator access denied."
    });
}

const adminEmail = decodedToken.email;
  
  // Apply Rate Limiting
  try {
    const now = Date.now();
    let timestamps = rateLimitStore.get(adminEmail) || [];
    timestamps = timestamps.filter(t => t > now - LIMIT_WINDOW_MS);

    if (timestamps.length >= MAX_REQUESTS) {
      const oldestTimestamp = timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil(((oldestTimestamp + LIMIT_WINDOW_MS) - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: "Too Many Requests: Rate limit exceeded. Please try again later.",
        retryAfter: retryAfterSeconds
      });
    }

    timestamps.push(now);
    rateLimitStore.set(adminEmail, timestamps);
  } catch (limiterErr) {
    console.error("[Limiter Error]", limiterErr);
  }

  // --- STEP 2: Validate Input Parameters ---
  const { requestId, action } = req.body;
  if (!requestId || typeof requestId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Bad Request: Missing or invalid parameter 'requestId'."
    });
  }

  if (action !== "approve" && action !== "reject") {
    return res.status(400).json({
      success: false,
      error: "Bad Request: Parameter 'action' must be 'approve' or 'reject'."
    });
  }

  // Get Client IP Address safely for audit logging
  const ipRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ipAddress = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;

  // --- STEP 3: Load the Firestore Document & Verify it exists ---
  let requestData: any = null;
  const docRef = db.collection("portfolio_access_requests").doc(requestId);

  try {
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        error: `Request ID ${requestId} not found.`
      });
    }
    requestData = docSnap.data();
  } catch (firestoreReadError: any) {
    console.error(`[Firestore Load Error] Failed to read request: ${requestId}`, firestoreReadError);
    return res.status(500).json({
      success: false,
      error: `Internal Database Error: Failed to load target request. ${firestoreReadError.message}`
    });
  }

  const { name, email } = requestData;

  // --- STEP 4: Update Firestore Document ---
  let portalToken = "";
  try {
    const { allowedProjects } = req.body;
    const existingPortalToken = requestData.portalToken;
    portalToken = existingPortalToken || crypto.randomBytes(24).toString("hex");

    const updatePayload: any = action === "approve"
      ? {
          status: "approved",
          approvedAt: FieldValue.serverTimestamp(),
          approvedBy: adminEmail,
          allowedProjects: allowedProjects !== undefined ? allowedProjects : (requestData.allowedProjects || []),
          portalToken,
          rejectedAt: null,
          rejectedBy: null
        }
      : {
          status: "rejected",
          rejectedAt: FieldValue.serverTimestamp(),
          rejectedBy: adminEmail,
          approvedAt: null,
          approvedBy: null
        };

    await docRef.update(updatePayload);
    console.log(`[Firestore Success] Updated request ${requestId} to state: ${action}`);
  } catch (firestoreUpdateError: any) {
    console.error(`[Firestore Update Error] Failed to write status for ${requestId}:`, firestoreUpdateError);
    // If Firestore update fails: Do NOT send email. Return HTTP 500.
    return res.status(500).json({
      success: false,
      error: `Firestore update failed: ${firestoreUpdateError.message}`
    });
  }

  // --- STEP 5: Send automatic notification email ---
  let emailSent = false;
  let emailErrorMsg = "";

  if (email) {
    try {
      const host = process.env.SMTP_HOST;
      const portStr = process.env.SMTP_PORT;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const fromAddress = process.env.SMTP_FROM;

      if (!host || !portStr || !user || !pass || !fromAddress) {
        throw new Error("SMTP server environment variables are incomplete.");
      }

      const port = parseInt(portStr, 10);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      let subject = "";
      let htmlContent = "";
      const portalLink = `${req.headers.origin || "https://obsidian-silicon-portfolio.com"}/portal?token=${portalToken}`;

      if (action === "approve") {
        subject = "Portfolio Access Approved";
        htmlContent = `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #6d28d9; margin-top: 0;">Portfolio Access Approved</h2>
            <p>Hello ${name},</p>
            <p>Your request has been approved.</p>
            <p>You may now access your secure download portal.</p>
            <p style="margin: 24px 0;">
              <a href="${portalLink}" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Download Portal
              </a>
            </p>
            <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:</p>
            <p style="font-size: 13px; color: #8b5cf6; word-break: break-all;">${portalLink}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 14px; margin-bottom: 0;">Regards,</p>
            <p style="font-weight: bold; margin-top: 4px; margin-bottom: 0;">Akshay S</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 2px;">Obsidian Architecture</p>
          </div>
        `;
      } else {
        subject = "Portfolio Access Update";
        htmlContent = `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #ef4444; margin-top: 0;">Portfolio Access Update</h2>
            <p>Hello ${name},</p>
            <p>Unfortunately your request has not been approved.</p>
            <p>Thank you for your interest.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 14px; margin-bottom: 0;">Regards,</p>
            <p style="font-weight: bold; margin-top: 4px; margin-bottom: 0;">Akshay S</p>
          </div>
        `;
      }

      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html: htmlContent,
        text: action === "approve"
          ? `Hello ${name},\n\nYour request has been approved.\n\nYou may now access your secure download portal.\n\nRegards,\n\nAkshay S`
          : `Hello ${name},\n\nUnfortunately your request has not been approved.\n\nThank you for your interest.\n\nRegards,\n\nAkshay S`
      });

      emailSent = true;
      console.log(`[Email Sent] Successfully sent ${action} notice to ${email}`);
    } catch (emailError: any) {
      console.error("[Email Sending Failed]", emailError);
      emailErrorMsg = emailError.message || String(emailError);
    }
  }

  // --- STEP 6: Write an Audit Log ---
  try {
    const auditCol = db.collection("admin_audit_logs");
    await auditCol.add({
      timestamp: FieldValue.serverTimestamp(),
      administratorEmail: adminEmail,
      requestId: requestId,
      action: action,
      result: emailSent ? "success" : "email_failed",
      emailFailed: !emailSent,
      emailErrorMessage: emailErrorMsg || null,
      ipAddress: ipAddress
    });
    console.log(`[Audit Logged] Successfully recorded audit log entry for request ${requestId}`);
  } catch (auditError: any) {
    // Audit log write failure shouldn't crash the whole response if DB wrote the main status.
    // However, we log it very loudly.
    console.error("[Audit Logging Failed]", auditError);
  }

  // --- STEP 7: Return final result ---
  if (!emailSent && email) {
    // If email fails: Keep Firestore update. Write audit log emailFailed = true.
    // Return { success: true, emailSent: false }
    return res.status(200).json({
      success: true,
      action,
      emailSent: false,
      error: `Email failed to send: ${emailErrorMsg}`
    });
  }

  return res.status(200).json({
    success: true,
    action,
    emailSent: emailSent || !email // if no email exists, then sending wasn't required, count as complete
  });
}

