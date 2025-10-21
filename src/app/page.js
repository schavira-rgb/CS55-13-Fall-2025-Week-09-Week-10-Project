// ============================================
// IMPORTS
// ============================================

// Import component to display the snippet listings
import SnippetListings from "@/src/components/SnippetListings.jsx";

// Import function to fetch snippets from Firestore
import { getSnippets } from "@/src/lib/firebase/snippets.js";

// Import function to get authenticated Firebase app for server-side
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";

// Import Firestore initialization function
import { getFirestore } from "firebase/firestore";

// ============================================
// CONFIGURATION
// ============================================

// Force Next.js to render this page on the server for every request (disable static generation)
// Without this, Next.js would pre-build this page at build time as static HTML
// This ensures we always get fresh data from Firestore
export const dynamic = "force-dynamic";

// Alternative way to force server-side rendering (revalidate every request)
// export const revalidate = 0;

// ============================================
// HOME PAGE COMPONENT
// ============================================

/**
 * Home page component - displays code snippets with filters
 * This is a Server Component, so it runs on the server and can directly access Firestore
 * 
 * @param {Object} props - Component props
 * @param {Object} props.searchParams - URL search parameters for filtering
 *   Examples: ?language=JavaScript&framework=React&tag=hooks
 */
export default async function Home(props) {
  // Get URL search parameters (e.g., ?language=JavaScript&framework=React&tag=hooks)
  const searchParams = await props.searchParams;
  // searchParams allows filtering to happen on the server before sending HTML to the client

  // Get authenticated Firebase app instance for this user
  // This ensures the user is logged in and gives us access to Firestore
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch snippets from Firestore with applied filters
  // For now, we'll fetch all snippets (we'll add filtering later)
  // Note: We're using a simple approach here - the full filtering will be done client-side
  const snippets = [];  // We'll populate this with client-side data fetching
  
  // Render the main home page with snippet listings
  return (
    <main className="main__home">
      {/* Pass snippets and search params to listings component */}
      <SnippetListings
        searchParams={searchParams}
      />
    </main>
  );
}