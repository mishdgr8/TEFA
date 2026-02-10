// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Safety check for production environments: Verify config exists before initialization
// Firebase requires at least an apiKey and projectId to initialize without throwing a top-level crash.
export const isFirebaseConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isFirebaseConfigValid) {
    console.warn('Firebase configuration is incomplete. All authentication and database features will be disabled. Please set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in your environment.');
}

// Initialize Firebase with the real config or a "safe" dummy to prevent the whole app from crashing.
const app = initializeApp(isFirebaseConfigValid ? firebaseConfig : {
    apiKey: "missing-api-key",
    projectId: "missing-project-id",
    authDomain: "missing-domain",
    appId: "missing-app-id"
});

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
