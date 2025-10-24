"use client";

// ============================================
// IMPORTS
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
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

  // ============================================
  // FETCH SNIPPETS FOR THIS LANGUAGE
  // ============================================

  useEffect(() => {
    // Build query for this specific language
    const snippetsRef = collection(db, "snippets");
    const q = query(
      snippetsRef,
      where("language", "==", languageName),
      orderBy("createdAt", "desc")
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
      {/* Header Section */}
      <div className="language-snippets-header">
        {/* Back to Home Link */}
        <Link href="/" className="back-link">
          ← Back to All Languages
        </Link>

        {/* Language Title */}
        <div className="language-title-section">
          <span className="language-page-icon">{getLanguageIcon(languageName)}</span>
          <div className="language-title-text">
            <h1>{languageName}</h1>
            <p className="language-snippet-count">
              {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
            </p>
          </div>
        </div>

        {/* Add Snippet Button */}
        {user && (
          <Link href="/add-snippet" className="add-snippet-button-small">
            + Add Snippet
          </Link>
        )}
      </div>

      {/* Snippets Grid */}
      {snippets.length === 0 ? (
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
          {snippets.map((snippet) => (
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