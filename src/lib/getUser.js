// Mark this as a client component (runs in browser, not server)
"use client";

// Import Firebase authentication state change listener
import { onAuthStateChanged } from "firebase/auth";
// Import React hooks for managing component state and side effects
import { useEffect, useState } from "react";

// Import Firebase authentication instance
import { auth } from "@/src/lib/firebase/clientApp.js";
// Import Next.js router (unused but kept for potential future use)
import { useRouter } from "next/navigation";

/**
 * Custom React hook to get the current authenticated user
 * Listens to Firebase authentication state changes and updates user state
 * 
 * @returns {Object|null} Current user object if authenticated, null if not authenticated
 */
export function useUser() {
  // State to store the current user (initially undefined)
  const [user, setUser] = useState();

  // Set up effect to listen for authentication state changes
  useEffect(() => {
    // Subscribe to Firebase auth state changes
    // Returns cleanup function to unsubscribe when component unmounts
    return onAuthStateChanged(auth, (authUser) => {
      // Update user state whenever authentication state changes
      setUser(authUser);
    });
  }, []); // Empty dependency array means this runs once on mount

  // Return the current user state
  return user;
}
