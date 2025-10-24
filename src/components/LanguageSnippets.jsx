"use client";

// ============================================
// IMPORTS
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
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
  const [user] = useAuthState(auth);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest"); // Default sort option

  // ============================================
  // FETCH SNIPPETS FOR THIS LANGUAGE
  // ============================================

  useEffect(() => {
    // Build query for this specific language (no orderBy - we'll sort client-side)
    const snippetsRef = collection(db, "snippets");
    const q = query(
      snippetsRef,
      where("language", "==", languageName)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const snippetData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSnippets(snippetData);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [languageName]);

  // ============================================
  // SORT SNIPPETS
  // ============================================

  const getSortedSnippets = () => {
    const sorted = [...snippets];

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateB - dateA; // Descending
        });
      
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate() || new Date(0);
          const dateB = b.createdAt?.toDate() || new Date(0);
          return dateA - dateB; // Ascending
        });
      
      case "titleAZ":
        return sorted.sort((a, b) => 
          (a.title || "").localeCompare(b.title || "")
        );
      
      case "titleZA":
        return sorted.sort((a, b) => 
          (b.title || "").localeCompare(a.title || "")
        );
      
      default:
        return sorted;
    }
  };

  const sortedSnippets = getSortedSnippets();

  // ============================================
  // LANGUAGE ICON MAPPING
  // ============================================

  const getLanguageIcon = (language) => {
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
      <div className="language-snippets-header" style={{ textAlign: 'center' }}>
        {/* Back to Home Link */}
        <Link href="/" className="back-link">
          ← Back to All Languages
        </Link>

        {/* Language Title - Centered */}
        <div className="language-title-section" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '0.5rem',
          margin: '1rem 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="language-page-icon" style={{ fontSize: '2rem' }}>
              {getLanguageIcon(languageName)}
            </span>
            <h1 style={{ margin: 0 }}>{languageName}</h1>
          </div>
          <p className="language-snippet-count" style={{ margin: 0 }}>
            {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          alignItems: 'center',
          margin: '1.5rem 0'
        }}>
          <label htmlFor="sort-select" style={{ 
            color: '#ECEFF4',
            fontWeight: '500'
          }}>
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '2px solid #61AFEF',
              backgroundColor: '#2E3440',
              color: '#ECEFF4',
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '500'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="titleAZ">Title A-Z</option>
            <option value="titleZA">Title Z-A</option>
          </select>
        </div>

        {/* Add Snippet Button - Centered */}
        {user && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
            <Link href="/add-snippet" className="add-snippet-button-small">
              + Add Snippet
            </Link>
          </div>
        )}
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
                  {snippet.framework && (
                    <span className="tag-framework">
                      {snippet.framework}
                    </span>
                  )}
                  {snippet.tags && snippet.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag-regular">
                      #{tag}
                    </span>
                  ))}
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