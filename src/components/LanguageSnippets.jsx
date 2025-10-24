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
    return icons[language.toLowerCase()] || "📝";
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading snippets...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: SNIPPETS LIST
  // ============================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-12">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-[#61AFEF] hover:text-[#4A9FDF] font-medium mb-6 transition-colors"
        >
          ← Back to All Languages
        </Link>

        {/* Language Title */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{getLanguageIcon(languageName)}</span>
          <div>
            <h1 className="text-5xl font-bold text-[#2E3440]">
              {languageName}
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
            </p>
          </div>
        </div>

        {/* Add Snippet Button */}
        {user && (
          <Link
            href="/add-snippet"
            className="inline-block px-6 py-3 bg-[#61AFEF] hover:bg-[#4A9FDF] text-white rounded-lg font-medium transition-colors shadow-md"
          >
            + Add Snippet
          </Link>
        )}
      </div>

      {/* Snippets Grid */}
      {snippets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-md">
          <p className="text-2xl text-gray-700 font-semibold mb-4">
            No {languageName} snippets yet
          </p>
          <p className="text-gray-600 mb-6">
            Be the first to add a {languageName} code snippet!
          </p>
          {user && (
            <Link
              href="/add-snippet"
              className="inline-block px-6 py-3 bg-[#61AFEF] hover:bg-[#4A9FDF] text-white rounded-lg font-medium transition-colors"
            >
              Add {languageName} Snippet
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <Link
              key={snippet.id}
              href={`/snippet/${snippet.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-[#61AFEF] h-full flex flex-col transform hover:-translate-y-1">
                {/* Snippet Title */}
                <h2 className="text-2xl font-bold text-[#2E3440] mb-3 group-hover:text-[#61AFEF] transition-colors">
                  {snippet.title}
                </h2>

                {/* Snippet Description */}
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {snippet.description}
                </p>

                {/* Tags/Badges */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {snippet.framework && (
                    <span className="px-3 py-1 bg-[#61AFEF] bg-opacity-20 text-[#61AFEF] rounded-full text-sm font-semibold">
                      {snippet.framework}
                    </span>
                  )}
                  {snippet.tags && snippet.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#ECEFF4] text-[#2E3440] rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                  {snippet.tags && snippet.tags.length > 3 && (
                    <span className="px-3 py-1 bg-[#ECEFF4] text-[#2E3440] rounded-full text-sm">
                      +{snippet.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer with Author and Date */}
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                  <span>By {snippet.author}</span>
                  <span>
                    {snippet.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>

                {/* View Details Indicator */}
                <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[#61AFEF] font-medium">
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