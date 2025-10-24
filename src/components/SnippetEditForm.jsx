"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for state and side effects
import { useEffect, useState } from "react";

// Next.js navigation
import { useRouter } from "next/navigation";
import Link from "next/link";

// Firebase Firestore functions
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase/clientApp";

// Firebase auth to check current user
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/lib/firebase/clientApp";

// Our Firebase function to update snippets
import { updateSnippet } from "@/src/lib/firebase/snippets";

// ============================================
// SNIPPET EDIT FORM COMPONENT
// ============================================

/**
 * SnippetEditForm Component
 * Pre-filled form for editing existing code snippets
 * 
 * @param {Object} props
 * @param {string} props.snippetId - The Firestore document ID of the snippet
 */
export default function SnippetEditForm({ snippetId }) {
  // Get current authenticated user
  const [user] = useAuthState(auth);
  
  // Next.js router for navigation
  const router = useRouter();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // State for loading the snippet data
  const [loading, setLoading] = useState(true);
  
  // State for error messages
  const [error, setError] = useState(null);
  
  // State for saving status
  const [saving, setSaving] = useState(false);

  // Form field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [framework, setFramework] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // ============================================
  // FETCH SNIPPET DATA
  // ============================================

  useEffect(() => {
    /**
     * Fetches the snippet from Firestore and pre-fills the form
     */
    async function fetchSnippet() {
      // Check if user is logged in
      if (!user) {
        setError("You must be logged in to edit snippets");
        setLoading(false);
        return;
      }

      try {
        // Get reference to the snippet document
        const snippetRef = doc(db, "snippets", snippetId);
        
        // Fetch the document
        const snippetDoc = await getDoc(snippetRef);

        // Check if document exists
        if (snippetDoc.exists()) {
          const data = snippetDoc.data();
          
          // Pre-fill all form fields with existing data
          setTitle(data.title || "");
          setDescription(data.description || "");
          setCode(data.code || "");
          setLanguage(data.language || "");
          setFramework(data.framework || "");
          
          // Convert tags array to comma-separated string
          setTags(data.tags ? data.tags.join(", ") : "");
          
          setIsPublic(data.isPublic !== undefined ? data.isPublic : true);
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

    // Call the fetch function when user state is available
    if (user !== undefined) {
      fetchSnippet();
    }
  }, [snippetId, user]);

  // ============================================
  // FORM SUBMIT HANDLER
  // ============================================

  /**
   * Handles form submission
   * Updates the snippet in Firestore
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title || !description || !code || !language) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if user is logged in
    if (!user) {
      alert("You must be logged in to edit snippets");
      return;
    }

    // Set saving state
    setSaving(true);

    try {
      // Prepare snippet data
      const snippetData = {
        title: title.trim(),
        description: description.trim(),
        code: code.trim(),
        language,
        framework: framework || null,
        // Convert comma-separated tags to array and trim whitespace
        tags: tags
          ? tags.split(",").map((tag) => tag.trim()).filter((tag) => tag)
          : [],
        isPublic,
        author: user.displayName || user.email,
        userId: user.uid,
      };

      // Update the snippet in Firestore
      await updateSnippet(snippetId, snippetData);

      // Redirect back to the snippet detail page
      router.push(`/snippet/${snippetId}`);
    } catch (error) {
      console.error("Error updating snippet:", error);
      alert("Failed to update snippet. Please try again.");
      setSaving(false);
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="snippet-edit-container">
        <div className="loading-container">
          <div className="loading-text">Loading snippet...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="snippet-edit-container">
        <div className="snippet-error-box">
          <p className="snippet-error-text">{error}</p>
          <Link href="/" className="snippet-error-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: EDIT FORM
  // ============================================

  return (
    <div className="snippet-edit-container">
      {/* Header with Back Button */}
      <div className="snippet-edit-header">
        <Link
          href={`/snippet/${snippetId}`}
          className="back-to-snippet-link"
        >
          ← Back to Snippet
        </Link>
        <h1 className="snippet-edit-title">Edit Snippet</h1>
        <p className="snippet-edit-subtitle">
          Make changes to your code snippet below
        </p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="snippet-edit-form">
        {/* Title Field */}
        <div className="form-group">
          <label className="form-label">
            Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., React useState Hook Example"
            className="form-input"
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label">
            Description <span className="required-star">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this code does..."
            rows={3}
            className="form-textarea"
            required
          />
        </div>

        {/* Code Field */}
        <div className="form-group">
          <label className="form-label">
            Code <span className="required-star">*</span>
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={12}
            className="form-textarea form-textarea-code"
            required
          />
        </div>

        {/* Language and Framework Row */}
        <div className="form-grid-2">
          {/* Language Field */}
          <div>
            <label className="form-label">
              Language <span className="required-star">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select a language</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
            </select>
          </div>

          {/* Framework Field */}
          <div>
            <label className="form-label">
              Framework (Optional)
            </label>
            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="e.g., React, Next.js, Django"
              className="form-input"
            />
          </div>
        </div>

        {/* Tags Field */}
        <div className="form-group">
          <label className="form-label">
            Tags (Optional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., hooks, state management, beginner"
            className="form-input"
          />
          <p className="form-helper-text">
            Separate tags with commas
          </p>
        </div>

        {/* Public/Private Toggle */}
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="form-checkbox"
          />
          <label className="checkbox-label">
            Make this snippet public
          </label>
        </div>

        {/* Action Buttons */}
        <div className="edit-form-buttons">
          <button
            type="submit"
            disabled={saving}
            className="edit-form-button-save"
          >
            {saving ? "Saving Changes..." : "💾 Save Changes"}
          </button>
          
          <Link
            href={`/snippet/${snippetId}`}
            className="edit-form-button-cancel"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}