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
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading snippet...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-lg text-red-800 font-semibold">{error}</p>
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
  // RENDER: EDIT FORM
  // ============================================

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link
          href={`/snippet/${snippetId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Snippet
        </Link>
        <h1 className="text-4xl font-bold">Edit Snippet</h1>
        <p className="text-gray-600 mt-2">
          Make changes to your code snippet below
        </p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        {/* Title Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., React useState Hook Example"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this code does..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Code Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code <span className="text-red-500">*</span>
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            required
          />
        </div>

        {/* Language and Framework Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Language Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework (Optional)
            </label>
            <input
              type="text"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="e.g., React, Next.js, Django"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tags Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., hooks, state management, beginner"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-8">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this snippet public
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`
              flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors
              ${saving ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {saving ? "Saving Changes..." : "💾 Save Changes"}
          </button>
          
          <Link
            href={`/snippet/${snippetId}`}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}