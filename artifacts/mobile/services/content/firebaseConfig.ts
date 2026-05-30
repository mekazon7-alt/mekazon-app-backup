/**
 * Firebase Configuration — Mekazon
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO SET UP (one-time, ~10 minutes):
 *
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Create a project" → name it "mekazon-app"
 * 3. Disable Google Analytics (not needed) → Create project
 * 4. Click "Firestore Database" in the left sidebar
 * 5. Click "Create database" → Start in TEST MODE → choose a region (eur3 or nam5)
 * 6. Click the gear icon ⚙️ → "Project settings"
 * 7. Scroll to "Your apps" → click the </> Web icon
 * 8. Register app name "mekazon-web" → copy the firebaseConfig object
 * 9. Paste your values into the FIREBASE_CONFIG below (replace the placeholders)
 * 10. In your Replit .env file add:
 *     EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
 *     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id-here
 *     EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id-here
 *
 * SECURITY (before going live):
 * In Firebase Console → Firestore → Rules, replace the rules with:
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /app_content/{document} {
 *         allow read: if true;          // anyone can read content
 *         allow write: if false;        // only backend/admin SDK can write
 *       }
 *     }
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDthHhPxfeQ_dhsVpFcI662Uv9ZFO7cZps",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "mekazon-app",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "1:142945307209:web:40e9d1c7f32463d4d8cd98",
};

/** Returns true only when all required Firebase env vars are set */
export function isFirebaseConfigured(): boolean {
  return !!(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.appId
  );
}

/** Firestore collection and document names */
export const FIRESTORE = {
  COLLECTION: "app_content",
  DOCUMENT: "v1",
} as const;