// ============================================
// SNIPPET EDIT PAGE
// ============================================
// Allows users to edit an existing code snippet
// Pre-fills form with current snippet data
// Updates snippet in Firestore on submit

import SnippetEditForm from "@/src/components/SnippetEditForm";

/**
 * Snippet Edit Page
 * Dynamic route: /snippet/[id]/edit
 * 
 * @param {Object} params - Route parameters
 * @param {string} params.id - The snippet ID from the URL
 */
export default async function EditSnippetPage({ params }) {
  // Extract the snippet ID from the URL
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Pass the snippet ID to the edit form component */}
      <SnippetEditForm snippetId={id} />
    </div>
  );
}