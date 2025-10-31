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
 * - Edit button (navigates to edit form)
 * - Delete button (removes snippet from Firestore)
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
      <div className="snippet-detail-container">
        <div className="loading-container">
          <div className="loading-text">Loading snippet...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================

  if (error || !snippet) {
    return (
      <div className="snippet-error-container">
        <div className="snippet-error-box">
          <p className="snippet-error-text">
            {error || "Snippet not found"}
          </p>
          <Link href="/" className="snippet-error-link">
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
    <div className="snippet-detail-container">
      {/* Back Button */}
      <Link href="/" className="back-to-snippets-link">
        ← Back to All Snippets
      </Link>

      {/* Snippet Card */}
      <div className="snippet-detail-card">
        {/* Header Section */}
        <div className="snippet-detail-header">
          <h1 className="snippet-detail-title">{snippet.title}</h1>
          <p className="snippet-detail-description">{snippet.description}</p>
        </div>

        {/* Tags/Badges */}
        <div className="snippet-detail-tags">
          <span className="tag-language">
            {snippet.language}
          </span>
          {snippet.framework && (
            <span className="tag-framework-badge">
              {snippet.framework}
            </span>
          )}
          {snippet.tags &&
            snippet.tags.map((tag, index) => (
              <span key={index} className="tag-standard">
                #{tag}
              </span>
            ))}
        </div>

        {/* Code Display */}
        <div className="snippet-code-section">
          <CodeDisplay code={snippet.code} language={snippet.language} />
        </div>

        {/* AI Explanation Section */}
        {explanation && (
          <div className="ai-explanation-box">
            <div className="ai-explanation-content">
              {/* Robot/AI Icon */}
              <span className="ai-icon">🤖</span>
              <div className="ai-text-container">
                <h3 className="ai-explanation-title">
                  AI Explanation
                </h3>
                {/* Display the explanation with preserved formatting */}
                <div className="ai-explanation-text">
                  {explanation}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Author and Date Info */}
        <div className="snippet-author-info">
          <div className="snippet-metadata">
            <span className="metadata-author">By {snippet.author}</span>
            <span className="metadata-separator">•</span>
            <span>{snippet.createdAt?.toDate().toLocaleDateString()}</span>
            {snippet.isPublic && (
              <>
                <span className="metadata-separator">•</span>
                <span className="metadata-public">Public</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="snippet-action-buttons">
          {/* Explain Code Button */}
          <button
            onClick={handleExplainCode}
            disabled={loadingExplanation}
            className={`explain-button ${
              explanation
                ? "explain-button-active"
                : "explain-button-inactive"
            }`}
          >
            {loadingExplanation
              ? "Explaining..."
              : explanation
              ? "Hide Explanation"
              : "🤖 Explain Code"}
          </button>

          {/* Edit Button - Only show if user owns this snippet */}
          {user && snippet.userId === user.uid && (
            <Link
              href={`/snippet/${snippet.id}/edit`}
              className="edit-button-link"
            >
              ✏️ Edit
            </Link>
          )}

          {/* Delete Button - Only show if user owns this snippet */}
          {user && snippet.userId === user.uid && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="delete-button"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Delete Snippet?</h2>
            <p className="modal-message">
              Are you sure you want to delete "{snippet.title}"? This action cannot be undone.
            </p>
            <div className="modal-buttons">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="modal-button-delete"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="modal-button-cancel"
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