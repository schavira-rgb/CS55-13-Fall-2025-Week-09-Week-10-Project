// Import authentication functions from Firebase Auth
import {
  GoogleAuthProvider,                          // Provider for Google Sign-In
  signInWithPopup,                             // Function to show the Google Sign-In popup
  onAuthStateChanged as _onAuthStateChanged,   // Listener for auth state changes
  onIdTokenChanged as _onIdTokenChanged,       // Listener for id token changes
} from "firebase/auth"; 

// Import the Firebase Auth instance for this app
import { auth } from "@/src/lib/firebase/clientApp"; 

// Set up listener for authentication state changes (login/logout)
export function onAuthStateChanged(cb) {
  // Call Firebase's onAuthStateChanged with our auth instance and callback
  return _onAuthStateChanged(auth, cb);
} 

// Set up listener for ID token changes (token refresh)
export function onIdTokenChanged(cb) {
  // Call Firebase's onIdTokenChanged with our auth instance and callback
  return _onIdTokenChanged(auth, cb);
}

// Sign in user using Google account popup
export async function signInWithGoogle() { 
  // Create a Google authentication provider
  const provider = new GoogleAuthProvider();

  try {
    // Open popup for Google sign-in
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors during sign-in process
    console.error("Error signing in with Google", error);
  }
}

// Sign out the currently authenticated user
export async function signOut() {
  try {
    // Call Firebase's signOut method to sign out the user
    return auth.signOut();
  } catch (error) { 
    // Log any errors during sign-out process
    console.error("Error signing out with Google", error);
  }
} 
