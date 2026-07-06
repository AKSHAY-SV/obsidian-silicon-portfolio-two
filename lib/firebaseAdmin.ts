import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  // Strip enclosing quotes if present
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  // Replace literal \n representations with actual newlines
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  const credential =
    projectId && clientEmail && privateKey
      ? admin.credential.cert({ projectId, clientEmail, privateKey })
      : admin.credential.applicationDefault();

  admin.initializeApp({ credential });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

export default admin;
export { adminDb, adminAuth, FieldValue };
