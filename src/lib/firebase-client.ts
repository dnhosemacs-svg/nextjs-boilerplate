"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

function assertClientConfig(): void {
  const missing = (
    ["apiKey", "authDomain", "projectId"] as const
  ).filter((key) => !firebaseConfig[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `[firebase-client] Faltan variables de entorno: ${missing
        .map((key) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)
        .join(", ")}. Revisa .env.local y reinicia el servidor de desarrollo.`,
    );
  }
}

function getFirebaseApp(): FirebaseApp {
  assertClientConfig();
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/** Instancia de Firebase Auth para el navegador (registro, etc.). */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
