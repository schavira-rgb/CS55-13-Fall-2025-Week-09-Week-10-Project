"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for state management
import { useState } from "react";

// Next.js router for navigation after saving
import { useRouter } from "next/navigation";

// Firebase auth to get current user
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/lib/firebase/clientApp";

// Our Firebase function to add snippets
import { addSnippet } from "@/src/lib/firebase/snippets";

// ============================================
// ADD SNIPPET PAGE COMPONENT
// ============================================

/**
 * Add Snippet Page
 * Form for users to create new code snippets
 */
export default function AddSnippetPage() {
  // Get current authenticated user
  const [user, loading] = useAuthState(auth);
  
  // Next.js router for navigation
  const router = useRouter();

  // ============================================
  // FORM STATE
  // ============================================
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    framework: "",
    tags: "",
    isPublic: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // FORM HANDLERS
  // ============================================

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.code.trim()) {
      setError("Code is required");
      return;
    }

    setSaving(true);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Prepare snippet data
      const snippetData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        code: formData.code,
        language: formData.language,
        framework: formData.framework.trim() || null,
        tags: tagsArray,
        isPublic: formData.isPublic,
        author: user?.uid || "anonymous",
      };

      // Add to Firestore
      await addSnippet(snippetData);

      // Redirect to home page
      router.push("/");
    } catch (err) {
      console.error("Error adding snippet:", err);
      setError("Failed to save snippet. Please try again.");
      setSaving(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // NOT AUTHENTICATED STATE
  // ============================================

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-yellow-800 font-semibold">
            Please sign in to add snippets
          </p>
          <p className="text-yellow-700 mt-2">
            You need to be logged in to create code snippets.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER FORM
  // ============================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add New Code Snippet</h1>
        <p className="text-gray-600">
          Create a new code snippet to share with the community
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Title Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., React useState Hook Example"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this code does..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Code Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code <span className="text-red-500">*</span>
          </label>
          <textarea
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Paste your code here..."
            rows="12"
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
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="C#">C#</option>
              <option value="PHP">PHP</option>
              <option value="Ruby">Ruby</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="Swift">Swift</option>
              <option value="Kotlin">Kotlin</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
              <option value="SQL">SQL</option>
            </select>
          </div>

          {/* Framework Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework (Optional)
            </label>
            <input
              type="text"
              name="framework"
              value={formData.framework}
              onChange={handleChange}
              placeholder="e.g., React, Vue, Django"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tags Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., hooks, state, beginner"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas
          </p>
        </div>

        {/* Public Checkbox */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this snippet public (visible to everyone)
            </span>
          </label>
        </div>

        {/* Form Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`
              px-6 py-3 rounded-md font-medium transition-colors
              ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
              text-white
            `}
          >
            {saving ? "Saving..." : "Save Snippet"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}