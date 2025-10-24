// Mark this as a client component (runs in browser, not server)
"use client";

// Import React and useEffect hook for side effects
import React, { useEffect } from "react";
// Import Next.js Link component for client-side navigation
import Link from "next/link";
// Import authentication functions
import {
  signInWithGoogle,   // Function to sign in with Google
  signOut,            // Function to sign out
  onIdTokenChanged,  // Listener for id token changes
} from "@/src/lib/firebase/auth.js";
// Import cookies management functions
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook to manage user session and sync auth state with cookies
function useUserSession(initialUser) {
  // Set up effect that runs when component mounts
  useEffect(() => {
    // Listens for changes to user's ID token
    return onIdTokenChanged(async (user) => {
      if (user) {
        // User is signed in, get their ID token
        const idToken = await user.getIdToken();
        // Store token in cookie for server-side access
        await setCookie("__session", idToken);
      } else {
        // User is signed out, delete the cookie
        await deleteCookie("__session");
      }
      // Check if user changed (prevents unnecessary reload)
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // Reload page to update server-rendered content with new auth state
      window.location.reload();
    });
  }, [initialUser]); // Re-run effect if initialUser changes

  // Return the current user
  return initialUser;
}

// Header component displaying app name and user profile
export default function Header({ initialUser }) { 
  // Current user using our custom hook
  const user = useUserSession(initialUser);

  // Handle sign-out button click
  const handleSignOut = (event) => {
    // Prevent default link behavior
    event.preventDefault();
    // Sign out the user
    signOut();
  };

  // Handle sign-in button click
  const handleSignIn = (event) => {
    // Prevent default link behavior
    event.preventDefault();
    // Initiate Google sign-in
    signInWithGoogle();
  };

  return (
    <header>
      {/* App logo and name, link to home page */}
      <Link 
        href="/" 
        className="logo group inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] border-2 border-white/20 hover:border-[#61AFEF]/50"
      > 
        {/* Code icon with background */}
        <span className="flex items-center justify-center w-10 h-10 text-2xl bg-[#61AFEF]/20 rounded-lg group-hover:bg-[#61AFEF]/30 group-hover:rotate-6 transition-all duration-300 border border-[#61AFEF]/30">
          {"</>"}
        </span>
        {/* App title with enhanced typography */}
        <span className="font-bold text-xl tracking-tight text-[#ECEFF4] drop-shadow-sm">
          Code Snippet Manager
        </span>
      </Link> 
      {user ? (
        // User signed-in, show profile menu
        <> 
          <div className="profile"> 
            <p>
              {/* Display user's profile picture or default image */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              /> 
              {/* Display user's display name */}
              {user.displayName}
            </p> 

            {/* Dropdown menu */}
            <div className="menu"> 
              ... 
              <ul>
                {/* Display user's name in menu */}
                <li>{user.displayName}</li> 

                {/* Sign out button */}
                <li> 
                  <a href="#" onClick={handleSignOut}> 
                    Sign Out 
                  </a> 
                </li> 
              </ul> 
            </div> 
          </div> 
        </>
      ) : (
        // User is not signed in, show sign in button
        <div className="profile"> 
          <a href="#" onClick={handleSignIn}> 
            <img src="/profile.svg" alt="A placeholder user image" /> 
            Sign In with Google 
          </a> 
        </div>
      )} 
    </header>
  );
}