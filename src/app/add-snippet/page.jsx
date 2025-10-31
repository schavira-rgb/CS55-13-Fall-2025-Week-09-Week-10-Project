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
        author: user?.displayName || user?.email || "Anonymous User",
        userId: user.uid,
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
      <div className="loading-state">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  // ============================================
  // NOT AUTHENTICATED STATE
  // ============================================

  if (!user) {
    return (
      <div className="not-authenticated-warning">
        <div className="warning-box">
          <p className="warning-title">
            Please sign in to add snippets
          </p>
          <p className="warning-text">
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
    <div className="add-snippet-container">
      {/* Page Header */}
      <div className="add-snippet-header">
        <h1 className="add-snippet-title">Add New Code Snippet</h1>
        <p className="add-snippet-subtitle">
          Create a new code snippet to share with the community
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="snippet-form">
        {/* Title Field */}
        <div className="form-group">
          <label className="form-label">
            Title <span className="required-star">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., React useState Hook Example"
            className="form-input"
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this code does..."
            rows="3"
            className="form-textarea"
          />
        </div>

        {/* Code Field */}
        <div className="form-group">
          <label className="form-label">
            Code <span className="required-star">*</span>
          </label>
          <textarea
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Paste your code here..."
            rows="12"
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
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="form-select"
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
            <label className="form-label">
              Framework (Optional)
            </label>
            <input
              type="text"
              name="framework"
              value={formData.framework}
              onChange={handleChange}
              placeholder="e.g., React, Vue, Django"
              className="form-input"
            />
          </div>
        </div>

        {/* Tags Field */}
        <div className="form-group">
          <label className="form-label">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., hooks, state, beginner"
            className="form-input"
          />
          <p className="form-helper-text">
            Separate tags with commas
          </p>
        </div>

        {/* Public Checkbox */}
        <div className="checkbox-container">
          <input
            type="checkbox"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="form-checkbox"
          />
          <label className="checkbox-label">
            Make this snippet public (visible to everyone)
          </label>
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button
            type="submit"
            disabled={saving}
            className="form-button-primary"
          >
            {saving ? "Saving..." : "Save Snippet"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="form-button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}