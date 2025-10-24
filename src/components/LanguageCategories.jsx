"use client";

// ============================================
// IMPORTS
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/lib/firebase/clientApp";

// ============================================
// LANGUAGE CATEGORIES HOME PAGE
// ============================================

/**
 * LanguageCategories Component
 * Displays language category cards as the home page
 * Each card shows language name and snippet count
 */
export default function LanguageCategories() {
  const [user] = useAuthState(auth);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================
  // FETCH LANGUAGES AND COUNTS
  // ============================================

  useEffect(() => {
    async function fetchLanguageCounts() {
      try {
        const snippetsRef = collection(db, "snippets");
        const snapshot = await getDocs(snippetsRef);
        
        // Count snippets per language
        const languageCounts = {};
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.language) {
            languageCounts[data.language] = (languageCounts[data.language] || 0) + 1;
          }
        });
        
        // Convert to array and sort by name
        const languageArray = Object.entries(languageCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setLanguages(languageArray);
      } catch (error) {
        console.error("Error fetching languages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguageCounts();
  }, []);

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
      <div className="language-categories-page">
        <div className="language-categories-container">
          <div className="loading-container">
            <div className="loading-text">Loading languages...</div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: LANGUAGE CATEGORIES
  // ============================================

  return (
    <div className="language-categories-page">
      <div className="language-categories-container">
        {/* Header Section */}
        <div className="language-categories-header">
          <h1 className="language-categories-title">
            Code Snippet Manager
          </h1>
          <p className="language-categories-subtitle">
            Browse {languages.reduce((sum, lang) => sum + lang.count, 0)} snippets across {languages.length} languages
          </p>
          
          {/* Add Snippet Button */}
          {user && (
            <Link href="/add-snippet" className="add-snippet-button">
              + Add New Snippet
            </Link>
          )}
        </div>

        {/* Language Category Cards Grid */}
        {languages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">
              No snippets yet!
            </p>
            <p className="empty-state-description">
              Start building your collection by adding your first code snippet.
            </p>
            {user && (
              <Link href="/add-snippet" className="empty-state-button">
                Add Your First Snippet
              </Link>
            )}
          </div>
        ) : (
          <div className="language-cards-grid">
            {languages.map((language) => (
              <Link
                key={language.name}
                href={`/language/${language.name}`}
                className="language-card-link"
              >
                <div className="language-card">
                  {/* Language Icon */}
                  <div className="language-icon">
                    {getLanguageIcon(language.name)}
                  </div>
                  
                  {/* Language Name */}
                  <h2 className="language-name">
                    {language.name}
                  </h2>
                  
                  {/* Snippet Count */}
                  <div className="snippet-count-container">
                    <span className="snippet-count-badge">
                      {language.count} {language.count === 1 ? "snippet" : "snippets"}
                    </span>
                  </div>
                  
                  {/* Arrow indicator on hover */}
                  <div className="browse-arrow">
                    <span className="browse-arrow-text">
                      Browse →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="language-categories-footer">
          <p className="language-categories-footer-text">
            Select a language to browse all snippets in that category
          </p>
        </div>
      </div>
    </div>
  );
}