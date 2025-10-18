// Import component to display the restaurant listings
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import function to fetch restaurants from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// Import function to get authenticated Firebase app for server-side
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import Firestore initialization function
import { getFirestore } from "firebase/firestore";

// Force Next.js to render this page on the server for every request (disable static generation)
// Without this, Next.js would pre-build this page at build time as static HTML
export const dynamic = "force-dynamic";

// Alternative way to force server-side rendering (revalidate every request)
// export const revalidate = 0;

// Home page component, displays the restaurant listings with filters
export default async function Home(props) {
  // Get URL search parameters (e.g., ?city=London&category=Indian&sort=Review)
  const searchParams = await props.searchParams;
  // searchParams allows filtering to happen on the server before sending HTML to the client

  // Get authenticated Firebase app instance for this user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch restaurants from Firestore with applied filters
  const restaurants = await getRestaurants(      // Pass Firestore instance
    getFirestore(firebaseServerApp),            // Pass filters from URL
    searchParams
  );
  
  // Render the main home page with restaurant listings
  return (
    <main className="main__home">
      {/* Pass restaurants and search params to listings component */}
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
