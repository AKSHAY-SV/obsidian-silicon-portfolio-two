import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Safely access import.meta.env supporting both dev and build states
const env = (import.meta as any).env || {};

// Environment variables take priority; the local firebase-applet-config.json acts as a fallback so
// the app remains usable when no VITE_FIREBASE_* variables are provided (e.g., AI Studio applets).
const configApiKey = env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey;
const configAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain;
const configProjectId = env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId;
const configAppId = env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId;
const configStorageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket;
const configMessagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId;
const configMeasurementId = env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId;
const configDatabaseId = env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

/**
 * Checks if the Firebase client SDK is fully and correctly configured.
 *
 * @returns {boolean} True if all required configuration keys are present, false otherwise.
 */
export function isFirebaseConfigured(): boolean {
  return !!(configApiKey && configAuthDomain && configProjectId && configAppId);
}

// Perform verification on module load to warn developers early
const missingRequired: string[] = [];
if (!configApiKey) missingRequired.push('VITE_FIREBASE_API_KEY');
if (!configAuthDomain) missingRequired.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!configProjectId) missingRequired.push('VITE_FIREBASE_PROJECT_ID');
if (!configAppId) missingRequired.push('VITE_FIREBASE_APP_ID');

if (missingRequired.length > 0) {
  console.error(
    `[Firebase Configuration Error] Missing required Firebase configuration keys:\n` +
    missingRequired.map(key => `  - ${key}`).join('\n') +
    `\nProvide these via env vars or firebase-applet-config.json. Database services may be unavailable.`
  );
}

// Safe default/dummy config for environment initialization to prevent early module load crash if variables are omitted
const firebaseConfig = {
  apiKey: configApiKey || 'MISSING_API_KEY',
  authDomain: configAuthDomain || 'MISSING_AUTH_DOMAIN',
  projectId: configProjectId || 'placeholder-project-id',
  storageBucket: configStorageBucket || undefined,
  messagingSenderId: configMessagingSenderId || undefined,
  appId: configAppId || 'MISSING_APP_ID',
  measurementId: configMeasurementId || undefined,
};

/**
 * The initialized FirebaseApp instance.
 * Ensures a single shared instance is used across the client lifetime.
 */
export const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

/**
 * The initialized Firestore Database instance.
 * Supports custom database IDs via VITE_FIREBASE_DATABASE_ID (or firebase-applet-config.json) if provided.
 */
export const db: Firestore = configDatabaseId
  ? getFirestore(app, configDatabaseId)
  : getFirestore(app);

/**
 * The initialized Firebase Authentication instance.
 */
export const auth: Auth = getAuth(app);
