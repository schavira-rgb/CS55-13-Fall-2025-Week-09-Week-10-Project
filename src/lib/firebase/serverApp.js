// Enforce that this code can only run the server, not the client
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

// Import Next.js cookies function for reading cookies requests
import { cookies } from "next/headers"; 
// Import firebase app functions
import { initializeServerApp, initializeApp } from "firebase/app";

// Import Firebase authentication function
import { getAuth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID
};

// Create authenticated Firebase app instance for server-side rendering
export async function getAuthenticatedAppForUser() {
  // Get the session cookie containing the user's authentication token
  const authIdToken = (await cookies()).get("__session")?.value;

  // Initialize Firebase Server App with authentication credentials
  // This allows using Firebase SDK on the server with user context
  // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
  const firebaseServerApp = initializeServerApp(
    initializeApp(firebaseConfig),                   // Initialize baseFirebase app with config
    { 
      authIdToken,                                  // Pass user's authentication token
    }  
  );

  // Get Auth instance from the intialized server app
  const auth = getAuth(firebaseServerApp);
  // Wait for auth state to be ready before proceeding
  await auth.authStateReady();

  // Return both the Firebase app instance and the current user
  return { firebaseServerApp, currentUser: auth.currentUser };
}