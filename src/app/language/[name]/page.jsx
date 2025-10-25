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
 * @param {string} params.name - The language name from the URL (may be URL-encoded)
 */
export default async function LanguagePage({ params }) {
  // Extract the language name from the URL
  const { name } = await params;
  
  // Decode URL-encoded characters (e.g., C%2B%2B becomes C++)
  // This fixes issues with special characters like + in language names
  const decodedLanguage = decodeURIComponent(name);

  return (
    <div className="page-wrapper-offwhite">
      {/* Pass the decoded language name to the component */}
      <LanguageSnippets languageName={decodedLanguage} />
    </div>
  );
}