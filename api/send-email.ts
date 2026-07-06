import nodemailer from "nodemailer";
import { adminAuth } from "../lib/firebaseAdmin";

// In-memory sliding window rate limiter
const rateLimitStore = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

/**
 * Vercel Serverless Function / Express Handler for sending automatic approval/rejection emails.
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

  // 1. Validate Administrator Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Missing or malformed Authorization header."
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid token format."
    });
  }

  let decodedToken: any;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (authError: any) {
    console.error("[Admin Auth Error]", authError);
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or expired administrator token."
    });
  }

  const adminEmail = decodedToken.email?.toLowerCase();
  if (adminEmail !== "crazyplayz61@gmail.com") {
    return res.status(403).json({
      success: false,
      error: "Forbidden: You are not authorized as an administrator."
    });
  }

  const adminIdentifier = adminEmail || decodedToken.uid || "anonymous-admin";

  console.log(`[Auth Success] Authenticated request from administrator: ${adminIdentifier}`);

  // 2. Apply Rate Limiting: 10 requests per minute per administrator
  try {
    const now = Date.now();
    let timestamps = rateLimitStore.get(adminIdentifier) || [];
    
    // Filter timestamps to keep only those within the 1-minute window
    timestamps = timestamps.filter(t => t > now - LIMIT_WINDOW_MS);

    if (timestamps.length >= MAX_REQUESTS) {
      const oldestTimestamp = timestamps[0];
      const retryAfterMs = (oldestTimestamp + LIMIT_WINDOW_MS) - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

      // Log the rate limit event
      console.warn(
        `[Rate Limit Exceeded] Administrator ${adminIdentifier} exceeded the email rate limit. ` +
        `Requests in last minute: ${timestamps.length}. Retry after: ${retryAfterSeconds}s.`
      );

      // Return 429 Too Many Requests
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: "Too Many Requests: Email rate limit exceeded. Please try again later.",
        retryAfter: retryAfterSeconds
      });
    }

    // Add current timestamp and save back to store
    timestamps.push(now);
    rateLimitStore.set(adminIdentifier, timestamps);

    // Periodically clean up other stale entries in the store to prevent memory growth
    if (Math.random() < 0.1) {
      for (const [key, val] of rateLimitStore.entries()) {
        const activeVals = val.filter(t => t > now - LIMIT_WINDOW_MS);
        if (activeVals.length === 0) {
          rateLimitStore.delete(key);
        } else if (activeVals.length !== val.length) {
          rateLimitStore.set(key, activeVals);
        }
      }
    }
  } catch (rateLimitErr) {
    // Never crash: if rate limiting fails, log and proceed
    console.error("[Rate Limiter Internal Error]", rateLimitErr);
  }

  // 3. Parse Request Body
  const { type, name, email, downloadPortalLink } = req.body;

  if (!type || !name || !email) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters: type, name, and email must be provided."
    });
  }

  if (type !== "approve" && type !== "reject") {
    return res.status(400).json({
      success: false,
      error: "Invalid request type. Must be 'approve' or 'reject'."
    });
  }

  // 4. Read SMTP credentials exclusively from server-side process.env
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM;

  const missingVars: string[] = [];
  if (!host) missingVars.push("SMTP_HOST");
  if (!portStr) missingVars.push("SMTP_PORT");
  if (!user) missingVars.push("SMTP_USER");
  if (!pass) missingVars.push("SMTP_PASS");
  if (!fromAddress) missingVars.push("SMTP_FROM");

  if (missingVars.length > 0) {
    console.error(`[Email Config Error] Missing SMTP environment variables: ${missingVars.join(", ")}`);
    return res.status(500).json({
      success: false,
      error: `SMTP configuration is incomplete. Missing environment variable(s): ${missingVars.join(", ")}.`
    });
  }

  // 5. Send Email via Secure SMTP Server
  try {
    const port = parseInt(portStr!, 10);
    const transporter = nodemailer.createTransport({
      host: host!,
      port,
      secure: port === 465,
      auth: {
        user: user!,
        pass: pass!,
      },
    });

    let subject = "";
    let htmlContent = "";

    if (type === "approve") {
      const portalLink = downloadPortalLink || `${req.headers.origin || "https://obsidian-silicon-portfolio.com"}/portal`;
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

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject,
      html: htmlContent,
      // Fallback text body
      text: type === "approve"
        ? `Hello ${name},\n\nYour request has been approved.\n\nYou may now access your secure download portal.\n\nRegards,\n\nAkshay S\nObsidian Architecture`
        : `Hello ${name},\n\nUnfortunately your request has not been approved.\n\nThank you for your interest.\n\nRegards,\n\nAkshay S`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Successfully sent ${type} email to ${email}. Message ID: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });

  } catch (error: any) {
    console.error("[Email Sending Failed]", error.message || error);
    return res.status(500).json({
      success: false,
      error: `Failed to send email securely: ${error.message}`
    });
  }
}
