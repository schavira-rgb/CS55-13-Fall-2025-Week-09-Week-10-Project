// ============================================
// LANGUAGE DETAIL PAGE
// ============================================
// Shows all snippets for a specific language
// Level 2 of the 3-level structure
// Route: /language/[name]

import LanguageSnippets from "@/src/components/LanguageSnippets";

/**
 * Language Detail Page
 * Dynamic route: /language/[name]
 * 
 * @param {Object} params - Route parameters
 * @param {string} params.name - The language name from the URL
 */
export default async function LanguagePage({ params }) {
  // Extract the language name from the URL
  const { name } = await params;

  return (
    <div className="min-h-screen bg-[#ECEFF4]">
      {/* Pass the language name to the component */}
      <LanguageSnippets languageName={name} />
    </div>
  );
}