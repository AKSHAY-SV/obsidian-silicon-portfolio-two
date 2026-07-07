var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv7 = __toESM(require("dotenv"), 1);

// api/send-email.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);

// lib/firebaseAdmin.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
import_dotenv.default.config();
var projectId = process.env.FIREBASE_PROJECT_ID;
var clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
var privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");
}
if (!import_firebase_admin.default.apps.length) {
  const credential = projectId && clientEmail && privateKey ? import_firebase_admin.default.credential.cert({ projectId, clientEmail, privateKey }) : import_firebase_admin.default.credential.applicationDefault();
  import_firebase_admin.default.initializeApp({ credential });
}
var adminDb = import_firebase_admin.default.firestore();
var adminAuth = import_firebase_admin.default.auth();
var FieldValue = import_firebase_admin.default.firestore.FieldValue;
var firebaseAdmin_default = import_firebase_admin.default;

// api/send-email.ts
var rateLimitStore = /* @__PURE__ */ new Map();
var LIMIT_WINDOW_MS = 60 * 1e3;
var MAX_REQUESTS = 10;
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use POST.`
    });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Missing or malformed Authorization header."
    });
  }
  const token = authHeader.substring(7);
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid token format."
    });
  }
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (authError) {
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
  try {
    const now = Date.now();
    let timestamps = rateLimitStore.get(adminIdentifier) || [];
    timestamps = timestamps.filter((t) => t > now - LIMIT_WINDOW_MS);
    if (timestamps.length >= MAX_REQUESTS) {
      const oldestTimestamp = timestamps[0];
      const retryAfterMs = oldestTimestamp + LIMIT_WINDOW_MS - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1e3));
      console.warn(
        `[Rate Limit Exceeded] Administrator ${adminIdentifier} exceeded the email rate limit. Requests in last minute: ${timestamps.length}. Retry after: ${retryAfterSeconds}s.`
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: "Too Many Requests: Email rate limit exceeded. Please try again later.",
        retryAfter: retryAfterSeconds
      });
    }
    timestamps.push(now);
    rateLimitStore.set(adminIdentifier, timestamps);
    if (Math.random() < 0.1) {
      for (const [key, val] of rateLimitStore.entries()) {
        const activeVals = val.filter((t) => t > now - LIMIT_WINDOW_MS);
        if (activeVals.length === 0) {
          rateLimitStore.delete(key);
        } else if (activeVals.length !== val.length) {
          rateLimitStore.set(key, activeVals);
        }
      }
    }
  } catch (rateLimitErr) {
    console.error("[Rate Limiter Internal Error]", rateLimitErr);
  }
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
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM;
  const missingVars = [];
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
  try {
    const port = parseInt(portStr, 10);
    const transporter = import_nodemailer.default.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
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
      text: type === "approve" ? `Hello ${name},

Your request has been approved.

You may now access your secure download portal.

Regards,

Akshay S
Obsidian Architecture` : `Hello ${name},

Unfortunately your request has not been approved.

Thank you for your interest.

Regards,

Akshay S`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Successfully sent ${type} email to ${email}. Message ID: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("[Email Sending Failed]", error.message || error);
    return res.status(500).json({
      success: false,
      error: `Failed to send email securely: ${error.message}`
    });
  }
}

// api/admin/request-action.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_nodemailer2 = __toESM(require("nodemailer"), 1);
var rateLimitStore2 = /* @__PURE__ */ new Map();
var LIMIT_WINDOW_MS2 = 60 * 1e3;
var MAX_REQUESTS2 = 15;
var db = adminDb;
async function handler2(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use POST.`
    });
  }
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
  if (!decodedToken.email || decodedToken.email.toLowerCase() !== REQUIRED_ADMIN) {
    return res.status(403).json({
      success: false,
      error: "Administrator access denied."
    });
  }
  const adminEmail = decodedToken.email;
  try {
    const now = Date.now();
    let timestamps = rateLimitStore2.get(adminEmail) || [];
    timestamps = timestamps.filter((t) => t > now - LIMIT_WINDOW_MS2);
    if (timestamps.length >= MAX_REQUESTS2) {
      const oldestTimestamp = timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + LIMIT_WINDOW_MS2 - now) / 1e3));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: "Too Many Requests: Rate limit exceeded. Please try again later.",
        retryAfter: retryAfterSeconds
      });
    }
    timestamps.push(now);
    rateLimitStore2.set(adminEmail, timestamps);
  } catch (limiterErr) {
    console.error("[Limiter Error]", limiterErr);
  }
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
  const ipRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const ipAddress = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;
  let requestData = null;
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
  } catch (firestoreReadError) {
    console.error(`[Firestore Load Error] Failed to read request: ${requestId}`, firestoreReadError);
    return res.status(500).json({
      success: false,
      error: `Internal Database Error: Failed to load target request. ${firestoreReadError.message}`
    });
  }
  const { name, email } = requestData;
  let portalToken = "";
  try {
    const { allowedProjects } = req.body;
    const existingPortalToken = requestData.portalToken;
    portalToken = existingPortalToken || import_crypto.default.randomBytes(24).toString("hex");
    const updatePayload = action === "approve" ? {
      status: "approved",
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: adminEmail,
      allowedProjects: allowedProjects !== void 0 ? allowedProjects : requestData.allowedProjects || [],
      portalToken,
      rejectedAt: null,
      rejectedBy: null
    } : {
      status: "rejected",
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: adminEmail,
      approvedAt: null,
      approvedBy: null
    };
    await docRef.update(updatePayload);
    console.log(`[Firestore Success] Updated request ${requestId} to state: ${action}`);
  } catch (firestoreUpdateError) {
    console.error(`[Firestore Update Error] Failed to write status for ${requestId}:`, firestoreUpdateError);
    return res.status(500).json({
      success: false,
      error: `Firestore update failed: ${firestoreUpdateError.message}`
    });
  }
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
      const transporter = import_nodemailer2.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
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
        text: action === "approve" ? `Hello ${name},

Your request has been approved.

You may now access your secure download portal.

Regards,

Akshay S` : `Hello ${name},

Unfortunately your request has not been approved.

Thank you for your interest.

Regards,

Akshay S`
      });
      emailSent = true;
      console.log(`[Email Sent] Successfully sent ${action} notice to ${email}`);
    } catch (emailError) {
      console.error("[Email Sending Failed]", emailError);
      emailErrorMsg = emailError.message || String(emailError);
    }
  }
  try {
    const auditCol = db.collection("admin_audit_logs");
    await auditCol.add({
      timestamp: FieldValue.serverTimestamp(),
      administratorEmail: adminEmail,
      requestId,
      action,
      result: emailSent ? "success" : "email_failed",
      emailFailed: !emailSent,
      emailErrorMessage: emailErrorMsg || null,
      ipAddress
    });
    console.log(`[Audit Logged] Successfully recorded audit log entry for request ${requestId}`);
  } catch (auditError) {
    console.error("[Audit Logging Failed]", auditError);
  }
  if (!emailSent && email) {
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
    emailSent: emailSent || !email
    // if no email exists, then sending wasn't required, count as complete
  });
}

// api/admin/audit-logs.ts
var import_dotenv2 = __toESM(require("dotenv"), 1);
import_dotenv2.default.config();
var db2 = adminDb;
async function handler3(req, res) {
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
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("[Audit Logs Auth Error]", error);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired administrator token." });
  }
  const adminEmail = decodedToken.email?.toLowerCase();
  if (adminEmail !== "crazyplayz61@gmail.com") {
    return res.status(403).json({ success: false, error: "Forbidden: Unauthorized administrator email." });
  }
  try {
    const querySnapshot = await db2.collection("admin_audit_logs").orderBy("timestamp", "desc").get();
    const logs = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      let timestampFormatted = "\u2014";
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
        administratorEmail: d.administratorEmail || "\u2014",
        requestId: d.requestId || "\u2014",
        action: d.action || "\u2014",
        result: d.result || "\u2014",
        emailFailed: !!d.emailFailed,
        emailErrorMessage: d.emailErrorMessage || null,
        ipAddress: d.ipAddress || "\u2014"
      });
    });
    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    console.error("[Admin Audit Logs Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}

// api/downloads/init.ts
var import_dotenv3 = __toESM(require("dotenv"), 1);
import_dotenv3.default.config();
var db3 = adminDb;
async function handler4(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid token parameter." });
  }
  try {
    const querySnapshot = await db3.collection("portfolio_access_requests").where("portalToken", "==", token).where("status", "==", "approved").get();
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
      allowedProjects: data.allowedProjects || []
    });
  } catch (error) {
    console.error("[Downloads Init Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}

// api/downloads/request-download.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var import_dotenv4 = __toESM(require("dotenv"), 1);
import_dotenv4.default.config();
var db4 = adminDb;
async function handler5(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }
  const { token, projectId: projectId2 } = req.body;
  if (!token || typeof token !== "string" || !projectId2 || typeof projectId2 !== "string") {
    return res.status(400).json({ success: false, error: "Missing token or projectId." });
  }
  try {
    const querySnapshot = await db4.collection("portfolio_access_requests").where("portalToken", "==", token).where("status", "==", "approved").get();
    if (querySnapshot.empty) {
      return res.status(403).json({ success: false, error: "Unauthorized: Invalid or revoked portal token." });
    }
    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    const requestId = docSnap.id;
    const allowedProjects = data.allowedProjects || [];
    if (!allowedProjects.includes(projectId2)) {
      return res.status(403).json({ success: false, error: "Forbidden: You are not authorized to download this resource." });
    }
    const downloadToken = import_crypto2.default.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    await db4.collection("download_tokens").add({
      token: downloadToken,
      requestId,
      projectId: projectId2,
      expiresAt: firebaseAdmin_default.firestore.Timestamp.fromDate(expiresAt),
      downloadCount: 0,
      used: false,
      maxDownloads: 5
    });
    return res.status(200).json({
      success: true,
      downloadUrl: `/api/downloads/serve?downloadToken=${downloadToken}`
    });
  } catch (error) {
    console.error("[Request Download Error]", error);
    return res.status(500).json({ success: false, error: "Internal error processing download authorization." });
  }
}

// api/downloads/serve.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv5 = __toESM(require("dotenv"), 1);
import_dotenv5.default.config();
var db5 = adminDb;
var PROJECT_FILES = {
  "rv32im-rtl-src": "SoC with Custom RISC-V Processor.zip",
  "axi4-crossbar-test": "APB Compliant UART Peripheral with Integrated FSM.zip",
  "rv32im-floorplan-def": "RV32IM 5-Stage Pipeline.zip",
  "8-bit-cpu": "8 Bit CPU.zip",
  "l2-cache-gate-netlist": "Cache Memory.zip"
};
function renderErrorPage(res, status, title, message) {
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
          \u26A0\uFE0F Security Guard Alert
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
async function handler6(req, res) {
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
    const querySnapshot = await db5.collection("download_tokens").where("token", "==", downloadToken).get();
    if (querySnapshot.empty) {
      return renderErrorPage(res, 403, "Access Forbidden", "The specified token does not exist, has expired, or has been revoked.");
    }
    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();
    const tokenDocRef = db5.collection("download_tokens").doc(tokenDoc.id);
    const { requestId, projectId: projectId2, expiresAt, downloadCount, used, maxDownloads } = tokenData;
    const now = firebaseAdmin_default.firestore.Timestamp.now();
    const isExpired = expiresAt && now.seconds > expiresAt.seconds;
    const isLimitReached = downloadCount >= (maxDownloads || 5);
    if (isExpired || used || isLimitReached) {
      if (!used) {
        await tokenDocRef.update({ used: true });
      }
      try {
        const reqDocRef = db5.collection("portfolio_access_requests").doc(requestId);
        const reqDocSnap = await reqDocRef.get();
        const reqData = reqDocSnap.exists ? reqDocSnap.data() : {};
        const email2 = reqData?.email || "unknown@user.com";
        const university2 = reqData?.university || "Unknown University";
        await db5.collection("download_logs").add({
          requestId,
          email: email2,
          university: university2,
          project: PROJECT_FILES[projectId2] || projectId2,
          downloadTime: firebaseAdmin_default.firestore.FieldValue.serverTimestamp(),
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
    const fileName = PROJECT_FILES[projectId2];
    if (!fileName) {
      return renderErrorPage(res, 404, "Resource Missing", "The requested project asset is not configured or could not be found.");
    }
    const filePath = import_path.default.join(process.cwd(), "public", "downloads", fileName);
    if (!import_fs.default.existsSync(filePath)) {
      console.error(`File not found on disk: ${filePath}`);
      return renderErrorPage(res, 404, "Asset Offline", "The file is physically missing from our engineering directory.");
    }
    const nextCount = (downloadCount || 0) + 1;
    await tokenDocRef.update({
      downloadCount: nextCount,
      used: nextCount >= (maxDownloads || 5)
    });
    let email = "unknown@user.com";
    let university = "Unknown University";
    try {
      const reqDocRef = db5.collection("portfolio_access_requests").doc(requestId);
      const reqDocSnap = await reqDocRef.get();
      if (reqDocSnap.exists) {
        const rData = reqDocSnap.data();
        email = rData?.email || email;
        university = rData?.university || university;
      }
    } catch (dbErr) {
      console.warn("Could not retrieve request details for audit logging", dbErr);
    }
    await db5.collection("download_logs").add({
      requestId,
      email,
      university,
      project: fileName,
      downloadTime: firebaseAdmin_default.firestore.FieldValue.serverTimestamp(),
      downloadIP: userIP,
      browser: userAgent,
      token: downloadToken,
      result: "success"
    });
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/zip");
    const fileStream = import_fs.default.createReadStream(filePath);
    fileStream.on("error", (err) => {
      console.error("Stream pipe error:", err);
      if (!res.headersSent) {
        return renderErrorPage(res, 500, "Streaming Failure", "A server error occurred while transferring files.");
      }
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error("[Serve Download Error]", error);
    return renderErrorPage(res, 500, "Server Error", `An internal error occurred: ${error.message}`);
  }
}

// api/downloads/analytics.ts
var import_dotenv6 = __toESM(require("dotenv"), 1);
import_dotenv6.default.config();
var db6 = adminDb;
async function handler7(req, res) {
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
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("[Analytics Auth Error]", error);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired administrator token." });
  }
  const adminEmail = decodedToken.email?.toLowerCase();
  if (adminEmail !== "crazyplayz61@gmail.com") {
    return res.status(403).json({ success: false, error: "Forbidden: Unauthorized administrator email." });
  }
  try {
    const querySnapshot = await db6.collection("download_logs").orderBy("downloadTime", "desc").get();
    const logs = [];
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      let downloadTimeFormatted = "\u2014";
      let downloadTimeMs = 0;
      if (d.downloadTime) {
        const date = d.downloadTime.toDate ? d.downloadTime.toDate() : new Date(d.downloadTime);
        downloadTimeFormatted = date.toLocaleString();
        downloadTimeMs = date.getTime();
      }
      logs.push({
        id: docSnap.id,
        requestId: d.requestId || "\u2014",
        email: d.email || "\u2014",
        university: d.university || "\u2014",
        project: d.project || "\u2014",
        downloadTime: downloadTimeFormatted,
        downloadTimeMs,
        downloadIP: d.downloadIP || "\u2014",
        browser: d.browser || "\u2014",
        token: d.token ? `${d.token.substring(0, 8)}...` : "\u2014",
        result: d.result || "\u2014"
      });
    });
    const totalDownloads = logs.length;
    const now = /* @__PURE__ */ new Date();
    const oneDay = 24 * 60 * 60 * 1e3;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - now.getDay() * oneDay;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let downloadsToday = 0;
    let downloadsThisWeek = 0;
    let downloadsThisMonth = 0;
    const projectCounts = {};
    const universityCounts = {};
    logs.forEach((log) => {
      if (log.result === "success") {
        if (log.downloadTimeMs >= startOfToday) downloadsToday++;
        if (log.downloadTimeMs >= startOfWeek) downloadsThisWeek++;
        if (log.downloadTimeMs >= startOfMonth) downloadsThisMonth++;
        projectCounts[log.project] = (projectCounts[log.project] || 0) + 1;
        if (log.university && log.university !== "\u2014" && log.university !== "Unknown University") {
          universityCounts[log.university] = (universityCounts[log.university] || 0) + 1;
        }
      }
    });
    let mostDownloadedProject = "\u2014";
    let maxProjCount = 0;
    for (const [p, count] of Object.entries(projectCounts)) {
      if (count > maxProjCount) {
        maxProjCount = count;
        mostDownloadedProject = p;
      }
    }
    if (mostDownloadedProject !== "\u2014") {
      mostDownloadedProject = `${mostDownloadedProject} (${maxProjCount} downloads)`;
    }
    let mostActiveUniversity = "\u2014";
    let maxUnivCount = 0;
    for (const [u, count] of Object.entries(universityCounts)) {
      if (count > maxUnivCount) {
        maxUnivCount = count;
        mostActiveUniversity = u;
      }
    }
    if (mostActiveUniversity !== "\u2014") {
      mostActiveUniversity = `${mostActiveUniversity} (${maxUnivCount} times)`;
    }
    let newestDownload = "None";
    const newestSuccess = logs.find((log) => log.result === "success");
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
  } catch (error) {
    console.error("[Downloads Analytics Error]", error);
    return res.status(500).json({ success: false, error: "Internal database query failure." });
  }
}

// api/projects/assets.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var ALLOWED_PROJECT_SLUGS = ["5-stage-pipeline-riscv", "rv32im-soc-processor", "uart", "cache-memory", "8-bit-cpu"];
var LOGICAL_KEYS = [
  "simulation",
  "synthesis",
  "timing",
  "layout",
  "floorplan",
  "gds",
  "gdsii",
  "rtl",
  "block-diagram",
  "documentation",
  "downloads"
];
var KEY_TO_DISK_FOLDERS = {
  simulation: ["waveforms", "simulation"],
  synthesis: ["synthesis"],
  timing: ["timing"],
  layout: ["gdsii", "gds", "layout"],
  floorplan: ["floorplan"],
  gds: ["gdsii", "gds", "layout"],
  gdsii: ["gdsii", "gds", "layout"],
  rtl: ["rtl"],
  "block-diagram": ["block-diagram", "diagram"],
  documentation: ["documentation", "docs"],
  downloads: ["downloads"]
};
var SUPPORTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf", ".zip", ".v", ".sv", ".chisel"];
async function handler8(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }
  const { project } = req.query;
  if (!project || typeof project !== "string") {
    return res.status(400).json({ success: false, error: "Missing or invalid 'project' parameter." });
  }
  if (!ALLOWED_PROJECT_SLUGS.includes(project)) {
    return res.status(400).json({ success: false, error: `Invalid project slug. Allowed: ${ALLOWED_PROJECT_SLUGS.join(", ")}` });
  }
  try {
    const scanTargets = [];
    scanTargets.push({
      dirPath: import_path2.default.join(process.cwd(), "public", "projects", project),
      servingPrefix: project
    });
    if (project === "5-stage-pipeline-riscv") {
      scanTargets.push({
        dirPath: import_path2.default.join(process.cwd(), "public", "projects", "rv32im-core"),
        servingPrefix: "5-stage-pipeline-riscv"
      });
    }
    const assetsMap = {};
    for (const key of LOGICAL_KEYS) {
      assetsMap[key] = [];
    }
    for (const target of scanTargets) {
      if (!import_fs2.default.existsSync(target.dirPath)) continue;
      for (const logicalKey of LOGICAL_KEYS) {
        const diskFolders = KEY_TO_DISK_FOLDERS[logicalKey] || [logicalKey];
        for (const diskSubdir of diskFolders) {
          const subdirPath = import_path2.default.join(target.dirPath, diskSubdir);
          if (import_fs2.default.existsSync(subdirPath)) {
            const files = await import_fs2.default.promises.readdir(subdirPath);
            for (const file of files) {
              const ext = import_path2.default.extname(file).toLowerCase();
              if (SUPPORTED_EXTENSIONS.includes(ext)) {
                const filePath = import_path2.default.join(subdirPath, file);
                const stats = await import_fs2.default.promises.stat(filePath);
                if (stats.isDirectory()) continue;
                const sizeInBytes = stats.size;
                let sizeStr = `${sizeInBytes} B`;
                if (sizeInBytes >= 1024 * 1024) {
                  sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
                } else if (sizeInBytes >= 1024) {
                  sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
                }
                if (assetsMap[logicalKey].some((item) => item.name === file)) continue;
                assetsMap[logicalKey].push({
                  name: file,
                  url: `/assets/projects/${target.servingPrefix}/${diskSubdir}/${file}`,
                  size: sizeStr
                });
              }
            }
          }
        }
      }
      const rootFiles = await import_fs2.default.promises.readdir(target.dirPath);
      for (const file of rootFiles) {
        const lowerFile = file.toLowerCase();
        if (lowerFile.includes("block-diagram") || lowerFile.includes("block_diagram") || lowerFile.includes("diagram")) {
          const ext = import_path2.default.extname(file).toLowerCase();
          if (SUPPORTED_EXTENSIONS.includes(ext)) {
            const filePath = import_path2.default.join(target.dirPath, file);
            const stats = await import_fs2.default.promises.stat(filePath);
            if (stats.isFile()) {
              const sizeInBytes = stats.size;
              let sizeStr = `${sizeInBytes} B`;
              if (sizeInBytes >= 1024 * 1024) {
                sizeStr = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
              } else if (sizeInBytes >= 1024) {
                sizeStr = `${(sizeInBytes / 1024).toFixed(1)} KB`;
              }
              if (!assetsMap["block-diagram"].some((item) => item.name === file)) {
                assetsMap["block-diagram"].push({
                  name: file,
                  url: `/assets/projects/${target.servingPrefix}/${file}`,
                  size: sizeStr
                });
              }
            }
          }
        }
      }
    }
    return res.status(200).json({
      success: true,
      project,
      assets: assetsMap
    });
  } catch (error) {
    console.error("[Project Assets Discovery Error]", error);
    return res.status(500).json({ success: false, error: "Internal server error scanning project directory." });
  }
}

// server.ts
import_dotenv7.default.config();
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
app.use(import_express.default.json());
app.get("/downloads/*.zip", (req, res) => {
  return res.status(403).json({ error: "Access denied. Direct downloads are strictly forbidden. Use the secure Downloads Portal." });
});
app.get("/public/downloads/*.zip", (req, res) => {
  return res.status(403).json({ error: "Access denied. Direct downloads are strictly forbidden. Use the secure Downloads Portal." });
});
app.post("/api/send-email", handler);
app.post("/api/admin/request-action", handler2);
app.get("/api/admin/audit-logs", handler3);
app.get("/api/downloads/init", handler4);
app.post("/api/downloads/request-download", handler5);
app.get("/api/downloads/serve", handler6);
app.get("/api/downloads/analytics", handler7);
app.use("/assets/projects/5-stage-pipeline-riscv", import_express.default.static(import_path3.default.join(process.cwd(), "public", "projects", "5-stage-pipeline-riscv")));
app.use("/assets/projects/5-stage-pipeline-riscv", import_express.default.static(import_path3.default.join(process.cwd(), "public", "projects", "rv32im-core")));
app.use("/assets/projects", import_express.default.static(import_path3.default.join(process.cwd(), "public", "projects")));
app.get("/api/projects/assets", handler8);
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("[Dev Server] Vite middleware integrated successfully.");
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
    console.log("[Prod Server] Static files serving from dist/ folder.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] App is listening on port ${PORT} host 0.0.0.0`);
  });
}
bootstrap();
//# sourceMappingURL=server.cjs.map
