import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type UserRecord } from "firebase-admin/auth";

import { getFirebaseAdminCredential } from "@/lib/server-env";

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const { projectId, clientEmail, privateKey } = getFirebaseAdminCredential();
  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return adminApp;
}

export type CreateFirebaseUserInput = {
  email: string;
  password: string;
  displayName?: string;
};

export async function createFirebaseUser(
  input: CreateFirebaseUserInput,
): Promise<UserRecord> {
  const auth = getAuth(getAdminApp());
  return auth.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    displayName: input.displayName,
    emailVerified: false,
  });
}

export function isFirebaseEmailAlreadyExists(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "auth/email-already-exists"
  );
}
