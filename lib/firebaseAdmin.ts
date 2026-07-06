import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n");

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
