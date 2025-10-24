// ============================================
// SNIPPET DETAIL PAGE
// ============================================
// Displays a single code snippet with full details
// Shows: title, description, code, tags, author, date
// Features: Explain Code button, Edit button, Delete button

import SnippetDetail from "@/src/components/SnippetDetail";

/**
 * Snippet Detail Page
 * Dynamic route: /snippet/[id]
 * 
 * @param {Object} params - Route parameters
 * @param {string} params.id - The snippet ID from the URL
 */
export default async function SnippetPage({ params }) {
  // Extract the snippet ID from the URL
  const { id } = await params;

  return (
    <div className="page-wrapper-gray">
      {/* Pass the snippet ID to the detail component */}
      <SnippetDetail snippetId={id} />
    </div>
  );
}