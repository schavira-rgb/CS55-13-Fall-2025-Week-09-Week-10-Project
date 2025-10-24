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
    return icons[language.toLowerCase()] || "📝";
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECEFF4] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading languages...</div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: LANGUAGE CATEGORIES
  // ============================================

  return (
    <div className="min-h-screen bg-[#ECEFF4] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-[#2E3440] mb-4">
            Code Snippet Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse {languages.reduce((sum, lang) => sum + lang.count, 0)} snippets across {languages.length} languages
          </p>
          
          {/* Add Snippet Button */}
          {user && (
            <Link
              href="/add-snippet"
              className="inline-block px-8 py-4 bg-[#61AFEF] hover:bg-[#4A9FDF] text-white rounded-lg font-semibold text-lg transition-colors shadow-lg"
            >
              + Add New Snippet
            </Link>
          )}
        </div>

        {/* Language Category Cards Grid */}
        {languages.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-md">
            <p className="text-2xl text-gray-700 font-semibold mb-4">
              No snippets yet!
            </p>
            <p className="text-gray-600 mb-6">
              Start building your collection by adding your first code snippet.
            </p>
            {user && (
              <Link
                href="/add-snippet"
                className="inline-block px-6 py-3 bg-[#61AFEF] hover:bg-[#4A9FDF] text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Snippet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {languages.map((language) => (
              <Link
                key={language.name}
                href={`/language/${language.name}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-[#61AFEF] transform hover:-translate-y-2">
                  {/* Language Icon */}
                  <div className="text-6xl mb-4 text-center">
                    {getLanguageIcon(language.name)}
                  </div>
                  
                  {/* Language Name */}
                  <h2 className="text-2xl font-bold text-[#2E3440] mb-2 text-center group-hover:text-[#61AFEF] transition-colors">
                    {language.name}
                  </h2>
                  
                  {/* Snippet Count */}
                  <div className="text-center">
                    <span className="inline-block px-4 py-2 bg-[#ECEFF4] text-[#2E3440] rounded-full font-semibold">
                      {language.count} {language.count === 1 ? "snippet" : "snippets"}
                    </span>
                  </div>
                  
                  {/* Arrow indicator on hover */}
                  <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#61AFEF] font-medium">
                      Browse →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Select a language to browse all snippets in that category
          </p>
        </div>
      </div>
    </div>
  );
}