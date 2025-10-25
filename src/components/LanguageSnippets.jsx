"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for managing component state and side effects
import { useEffect, useState } from "react";
// Next.js Link component for client-side navigation between pages
import Link from "next/link";
// Firebase Firestore functions for database operations
import { collection, query, where, onSnapshot } from "firebase/firestore";
// Firebase database instance for Firestore operations
import { db } from "@/src/lib/firebase/clientApp";
// React hook for managing Firebase authentication state
import { useAuthState } from "react-firebase-hooks/auth";
// Firebase authentication instance
import { auth } from "@/src/lib/firebase/clientApp";

// ============================================
// LANGUAGE SNIPPETS COMPONENT
// ============================================

/**
 * LanguageSnippets Component
 * Shows all snippets for a specific programming language
 * Level 2: Shows snippet cards (title, description, tags only - NO CODE)
 * 
 * @param {Object} props
 * @param {string} props.languageName - The programming language to filter by
 */
export default function LanguageSnippets({ languageName }) {
  // Get current authenticated user from Firebase auth state
  const [user] = useAuthState(auth);
  // State to store array of snippets fetched from Firestore
  const [snippets, setSnippets] = useState([]);
  // State to track if data is currently being loaded
  const [loading, setLoading] = useState(true);
  // State to store current sorting option (newest, oldest, titleAZ, titleZA)
  const [sortBy, setSortBy] = useState("newest"); // Default sort option

  // ============================================
  // FETCH SNIPPETS FOR THIS LANGUAGE
  // ============================================

  useEffect(() => {
    // Build query for this specific language (no orderBy - we'll sort client-side)
    // Get reference to the snippets collection in Firestore
    const snippetsRef = collection(db, "snippets");
    // Create a query that filters snippets by the specified language
    const q = query(
      snippetsRef,
      where("language", "==", languageName)
    );

    // Set up real-time listener
    // Subscribe to changes in the query results
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Transform Firestore documents into plain JavaScript objects
      const snippetData = snapshot.docs.map((doc) => ({
        id: doc.id, // Include the document ID
        ...doc.data(), // Spread all document fields
      }));
      // Update snippets state with the fetched data
      setSnippets(snippetData);
      // Mark loading as complete
      setLoading(false);
    });

    // Cleanup listener on unmount
    // Return cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [languageName]); // Re-run effect when languageName changes

  // ============================================
  // SORT SNIPPETS
  // ============================================

  const getSortedSnippets = () => {
    // Create a copy of the snippets array to avoid mutating the original
    const sorted = [...snippets];

    // Sort based on the selected sort option
    switch (sortBy) {
      case "newest":
        // Sort by creation date, newest first (descending order)
        return sorted.sort((a, b) => {
          // Convert Firestore timestamp to JavaScript Date, fallback to epoch if null
          const dateA = a.createdAt?.toDate() || new Date(0);
          // Convert Firestore timestamp to JavaScript Date, fallback to epoch if null
          const dateB = b.createdAt?.toDate() || new Date(0);
          // Return difference for descending sort (newest first)
          return dateB - dateA; // Descending
        });
      
      case "oldest":
        // Sort by creation date, oldest first (ascending order)
        return sorted.sort((a, b) => {
          // Convert Firestore timestamp to JavaScript Date, fallback to epoch if null
          const dateA = a.createdAt?.toDate() || new Date(0);
          // Convert Firestore timestamp to JavaScript Date, fallback to epoch if null
          const dateB = b.createdAt?.toDate() || new Date(0);
          // Return difference for ascending sort (oldest first)
          return dateA - dateB; // Ascending
        });
      
      case "titleAZ":
        // Sort by title alphabetically A-Z
        return sorted.sort((a, b) => 
          // Use localeCompare for proper string comparison, fallback to empty string if null
          (a.title || "").localeCompare(b.title || "")
        );
      
      case "titleZA":
        // Sort by title alphabetically Z-A
        return sorted.sort((a, b) => 
          // Use localeCompare for proper string comparison, fallback to empty string if null
          (b.title || "").localeCompare(a.title || "")
        );
      
      default:
        // Return unsorted array if no valid sort option
        return sorted;
    }
  };

  // Call the sorting function and store the result
  const sortedSnippets = getSortedSnippets();

  // ============================================
  // LANGUAGE ICON MAPPING
  // ============================================

  const getLanguageIcon = (language) => {
    // Object mapping language names to emoji icons
    const icons = {
      javascript: "📜",
      typescript: "📘",
      python: "🐍",
      java: "☕",
      csharp: "#️⃣",
      php: "🐘",
      ruby: "💎",
      go: "🐹",
      rust: "🦀",
      swift: "🦅",
      kotlin: "🎯",
      html: "🌐",
      css: "🎨",
      sql: "🗄️",
      bash: "💻",
    };
    // Return the icon for the language, or default document icon if not found
    return icons[language.toLowerCase()] || "📄";
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="snippets-loading">
        <div className="snippets-loading-text">Loading snippets...</div>
      </div>
    );
  }

  // ============================================
  // RENDER: SNIPPETS LIST
  // ============================================

  return (
    <div className="language-snippets-container">
      {/* Header Section - CENTERED */}
      <div className="language-snippets-header" style={{ 
        display: 'flex', // Use flexbox layout
        flexDirection: 'column', // Stack items vertically
        alignItems: 'center', // Center items horizontally
        textAlign: 'center' // Center text content
      }}>
        {/* Back to Home Link */}
        <Link href="/" className="back-link">
          ← Back to All Languages
        </Link>

        {/* Language Title, Sort Dropdown, and Add Button Container */}
        <div style={{ 
          display: 'flex', // Use flexbox layout
          flexDirection: 'column', // Stack items vertically
          alignItems: 'center', // Center items horizontally
          gap: '1rem', // Space between items
          margin: '1.5rem 0', // Vertical margin
          width: '100%', // Full width
          maxWidth: '400px' // Maximum width constraint
        }}>
          {/* Language Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="language-page-icon" style={{ fontSize: '2rem' }}>
              {/* Display the language icon */}
              {getLanguageIcon(languageName)}
            </span>
            <h1 style={{ margin: 0 }}>{languageName}</h1>
          </div>
          
          <p className="language-snippet-count" style={{ margin: 0 }}>
            {/* Display snippet count with proper pluralization */}
            {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
          </p>

          {/* Sort Dropdown */}
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem', // Internal spacing
              borderRadius: '8px', // Rounded corners
              border: '2px solid #61AFEF', // Blue border
              backgroundColor: '#2E3440', // Dark background
              color: '#ECEFF4', // Light text color
              fontSize: '1rem', // Font size
              cursor: 'pointer', // Pointer cursor on hover
              outline: 'none', // Remove default outline
              fontWeight: '500', // Medium font weight
              width: '100%' // Full width
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="titleAZ">Title A-Z</option>
            <option value="titleZA">Title Z-A</option>
          </select>

          {/* Add Snippet Button */}
          {user && (
            <Link href="/add-snippet" className="add-snippet-button-small" style={{
              width: '100%', // Full width
              textAlign: 'center', // Center text
              display: 'block' // Block display
            }}>
              + Add Snippet
            </Link>
          )}
        </div>
      </div>

      {/* Snippets Grid */}
      {sortedSnippets.length === 0 ? (
        <div className="language-empty-state">
          <p className="language-empty-title">
            No {languageName} snippets yet
          </p>
          <p className="language-empty-description">
            Be the first to add a {languageName} code snippet!
          </p>
          {user && (
            <Link href="/add-snippet" className="add-snippet-button-small">
              Add {languageName} Snippet
            </Link>
          )}
        </div>
      ) : (
        <div className="snippets-grid">
          {/* Map through sorted snippets to create snippet cards */}
          {sortedSnippets.map((snippet) => (
            <Link
              key={snippet.id}
              href={`/snippet/${snippet.id}`}
              className="snippet-card-link"
            >
              <div className="snippet-card">
                {/* Snippet Title */}
                <h2 className="snippet-card-title">
                  {snippet.title}
                </h2>

                {/* Snippet Description */}
                <p className="snippet-description">
                  {snippet.description}
                </p>

                {/* Tags/Badges */}
                <div className="snippet-tags">
                  {/* Show framework badge if framework exists */}
                  {snippet.framework && (
                    <span className="tag-framework">
                      {snippet.framework}
                    </span>
                  )}
                  {/* Map through first 3 tags to display them */}
                  {snippet.tags && snippet.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag-regular">
                      #{tag}
                    </span>
                  ))}
                  {/* Show "+X more" if there are more than 3 tags */}
                  {snippet.tags && snippet.tags.length > 3 && (
                    <span className="tag-regular">
                      +{snippet.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer with Author and Date */}
                <div className="snippet-footer">
                  <span>By {snippet.author}</span>
                  <span>
                    {/* Convert Firestore timestamp to localized date string */}
                    {snippet.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>

                {/* View Details Indicator */}
                <div className="view-code-arrow">
                  <span className="view-code-text">
                    View Code →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}