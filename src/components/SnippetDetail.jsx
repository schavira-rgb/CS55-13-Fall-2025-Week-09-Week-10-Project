"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for state and side effects
import { useEffect, useState } from "react";

// Next.js navigation and routing
import { useRouter } from "next/navigation";
import Link from "next/link";

// Firebase Firestore functions
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";

// Firebase auth to check current user
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/lib/firebase/clientApp";

// Our CodeDisplay component for syntax highlighting
import CodeDisplay from "@/src/components/CodeDisplay";

// ============================================
// SNIPPET DETAIL COMPONENT
// ============================================

/**
 * SnippetDetail Component
 * Displays a single code snippet with full details and actions
 * 
 * Features:
 * - Display snippet with syntax highlighting
 * - AI "Explain Code" button (Gemini AI)
 * - Delete button (removes snippet from Firestore)
 * - Edit button (future implementation)
 * 
 * @param {Object} props
 * @param {string} props.snippetId - The Firestore document ID of the snippet
 */
export default function SnippetDetail({ snippetId }) {
  // Get current authenticated user
  const [user] = useAuthState(auth);
  
  // Next.js router for navigation
  const router = useRouter();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // State for the snippet data
  const [snippet, setSnippet] = useState(null);
  
  // State for loading status
  const [loading, setLoading] = useState(true);
  
  // State for error messages
  const [error, setError] = useState(null);

  // ============================================
  // AI EXPLANATION STATE
  // ============================================
  
  // State for AI explanation text
  const [explanation, setExplanation] = useState(null);
  
  // State for loading explanation
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // ============================================
  // DELETE STATE
  // ============================================
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // State for deleting process
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // FETCH SNIPPET DATA
  // ============================================

  useEffect(() => {
    /**
     * Fetches the snippet from Firestore by ID
     */
    async function fetchSnippet() {
      try {
        // Get reference to the snippet document
        const snippetRef = doc(db, "snippets", snippetId);
        
        // Fetch the document
        const snippetDoc = await getDoc(snippetRef);

        // Check if document exists
        if (snippetDoc.exists()) {
          // Set snippet data with ID included
          setSnippet({
            id: snippetDoc.id,
            ...snippetDoc.data(),
          });
        } else {
          // Document not found
          setError("Snippet not found");
        }
      } catch (err) {
        // Handle any errors
        console.error("Error fetching snippet:", err);
        setError("Failed to load snippet");
      } finally {
        // Always set loading to false when done
        setLoading(false);
      }
    }

    // Call the fetch function
    fetchSnippet();
  }, [snippetId]); // Re-run if snippetId changes

  // ============================================
  // AI EXPLANATION HANDLER
  // ============================================

  /**
   * Handles the "Explain Code" button click
   * Sends code to Gemini AI API and displays explanation
   */
  const handleExplainCode = async () => {
    // If explanation already exists, hide it (toggle off)
    if (explanation) {
      setExplanation(null);
      return;
    }

    // Set loading state
    setLoadingExplanation(true);

    try {
      // Call our API endpoint with the code and language
      const response = await fetch("/api/explain-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: snippet.code,
          language: snippet.language,
        }),
      });

      // Parse the JSON response
      const data = await response.json();

      // Check if the request was successful
      if (data.success) {
        // Store the explanation
        setExplanation(data.explanation);
      } else {
        // Show error if API request failed
        alert(data.error || "Failed to explain code");
      }
    } catch (error) {
      // Handle any network or parsing errors
      console.error("Error explaining code:", error);
      alert("Failed to explain code. Please try again.");
    } finally {
      // Clear loading state
      setLoadingExplanation(false);
    }
  };

  // ============================================
  // DELETE HANDLER
  // ============================================

  /**
   * Handles the delete button click
   * Deletes the snippet from Firestore and redirects to home
   */
  const handleDelete = async () => {
    // Set deleting state
    setDeleting(true);

    try {
      // Get reference to the snippet document
      const snippetRef = doc(db, "snippets", snippetId);
      
      // Delete the document from Firestore
      await deleteDoc(snippetRef);

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error) {
      // Handle any errors
      console.error("Error deleting snippet:", error);
      alert("Failed to delete snippet. Please try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading snippet...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================

  if (error || !snippet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-lg text-red-800 font-semibold">
            {error || "Snippet not found"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: SNIPPET DETAIL
  // ============================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Back to All Snippets
      </Link>

      {/* Snippet Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-3">{snippet.title}</h1>
          <p className="text-gray-600 text-lg">{snippet.description}</p>
        </div>

        {/* Tags/Badges */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {snippet.language}
          </span>
          {snippet.framework && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {snippet.framework}
            </span>
          )}
          {snippet.tags &&
            snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
        </div>

        {/* Code Display */}
        <div className="mb-6">
          <CodeDisplay code={snippet.code} language={snippet.language} />
        </div>

        {/* AI Explanation Section */}
        {explanation && (
          <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              {/* Robot/AI Icon */}
              <span className="text-3xl">🤖</span>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 text-xl mb-3">
                  AI Explanation
                </h3>
                {/* Display the explanation with preserved formatting */}
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Author and Date Info */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="font-medium">By {snippet.author}</span>
            <span className="mx-2">•</span>
            <span>{snippet.createdAt?.toDate().toLocaleDateString()}</span>
            {snippet.isPublic && (
              <>
                <span className="mx-2">•</span>
                <span className="text-green-600 font-medium">Public</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {/* Explain Code Button */}
          <button
            onClick={handleExplainCode}
            disabled={loadingExplanation}
            className={`
              px-6 py-3 rounded-md font-medium transition-colors
              ${
                explanation
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-800"
              }
              ${loadingExplanation ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {loadingExplanation
              ? "Explaining..."
              : explanation
              ? "Hide Explanation"
              : "🤖 Explain Code"}
          </button>

          {/* Edit Button (placeholder for future implementation) */}
          {user && (
            <button
              onClick={() => alert("Edit feature coming soon!")}
              className="px-6 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md font-medium transition-colors"
            >
              ✏️ Edit
            </button>
          )}

          {/* Delete Button */}
          {user && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-md font-medium transition-colors"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">Delete Snippet?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{snippet.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`
                  flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors
                  ${deleting ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}