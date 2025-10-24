"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for state management and side effects
import { useEffect, useState } from "react";

// Next.js Link component for client-side navigation
import Link from "next/link";

// Our Firebase function to fetch snippets in real-time
import { getSnippets, getLanguages, getFrameworks, getAllTags } from "@/src/lib/firebase/snippets";

// Our CodeDisplay component to show code with syntax highlighting
import CodeDisplay from "@/src/components/CodeDisplay";

// Firebase auth hook to check if user is logged in
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/src/lib/firebase/clientApp";

// ============================================
// SNIPPET LISTINGS COMPONENT
// ============================================

/**
 * SnippetListings Component
 * Displays a filterable list of code snippets
 * 
 * @param {Object} props
 * @param {Object} props.searchParams - URL search parameters for filtering
 */
export default function SnippetListings({ searchParams = {} }) {
  // Get current authenticated user
  const [user] = useAuthState(auth);

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // State for storing snippets from Firestore
  const [snippets, setSnippets] = useState([]);
  
  // State for tracking loading status
  const [loading, setLoading] = useState(true);
  
  // State for storing filter options
  const [languages, setLanguages] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [tags, setTags] = useState([]);
  
  // State for current filter selections
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.language || "");
  const [selectedFramework, setSelectedFramework] = useState(searchParams.framework || "");
  const [selectedTag, setSelectedTag] = useState(searchParams.tag || "");

  // ============================================
  // DATA FETCHING
  // ============================================

  // Fetch snippets when filters change
  useEffect(() => {
    // Build filter object based on current selections
    const filters = {};
    if (selectedLanguage) filters.language = selectedLanguage;
    if (selectedFramework) filters.framework = selectedFramework;
    if (selectedTag) filters.tag = selectedTag;

    // Set up real-time listener for snippets
    const unsubscribe = getSnippets(filters, (data) => {
      setSnippets(data);
      setLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts or filters change
    return () => unsubscribe();
  }, [selectedLanguage, selectedFramework, selectedTag]);

  // Fetch filter options on component mount
  useEffect(() => {
    // Fetch all available languages
    getLanguages().then(setLanguages);
    
    // Fetch all available frameworks
    getFrameworks().then(setFrameworks);
    
    // Fetch all available tags
    getAllTags().then(setTags);
  }, []);

  // ============================================
  // FILTER HANDLERS
  // ============================================

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleFrameworkChange = (e) => {
    setSelectedFramework(e.target.value);
  };

  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedLanguage("");
    setSelectedFramework("");
    setSelectedTag("");
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="listings-container">
        <div className="loading-container">
          <div className="loading-text">Loading snippets...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN CONTENT
  // ============================================

  return (
    <div className="listings-container">
      {/* Page Header */}
      <div className="listings-header">
        <div>
          <h1 className="listings-title">Code Snippet Manager</h1>
          <p className="listings-subtitle">
            Browse and search through {snippets.length} code snippet{snippets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Add Snippet Button - only show if user is logged in */}
        {user && (
          <Link href="/add-snippet" className="add-snippet-button-header">
            + Add Snippet
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <h2 className="filters-title">Filters</h2>
        
        <div className="filters-grid">
          {/* Language Filter */}
          <div>
            <label className="form-label">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="form-select"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Framework Filter */}
          <div>
            <label className="form-label">
              Framework
            </label>
            <select
              value={selectedFramework}
              onChange={handleFrameworkChange}
              className="form-select"
            >
              <option value="">All Frameworks</option>
              {frameworks.map((fw) => (
                <option key={fw} value={fw}>
                  {fw}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="form-label">
              Tag
            </label>
            <select
              value={selectedTag}
              onChange={handleTagChange}
              className="form-select"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedLanguage || selectedFramework || selectedTag) && (
          <button
            onClick={handleClearFilters}
            className="clear-filters-button"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Snippets List */}
      {snippets.length === 0 ? (
        // Empty State
        <div className="listings-empty-state">
          <p className="listings-empty-title">No snippets found</p>
          <p className="listings-empty-text">
            {selectedLanguage || selectedFramework || selectedTag
              ? "Try adjusting your filters"
              : "Add your first code snippet to get started!"}
          </p>
        </div>
      ) : (
        // Snippets List
        <div className="snippets-list">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="snippet-list-card">
              {/* Snippet Header */}
              <div className="snippet-list-header">
                <h3 className="snippet-list-title">{snippet.title}</h3>
                <p className="snippet-list-description">{snippet.description}</p>
              </div>

              {/* Tags/Badges */}
              <div className="snippet-list-tags">
                <span className="tag-language">
                  {snippet.language}
                </span>
                {snippet.framework && (
                  <span className="tag-framework-badge">
                    {snippet.framework}
                  </span>
                )}
                {snippet.tags && snippet.tags.map((tag, index) => (
                  <span key={index} className="tag-standard">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Code Display */}
              <CodeDisplay code={snippet.code} language={snippet.language} />

              {/* Snippet Footer with Action Buttons */}
              <div className="snippet-list-footer">
                {/* Author and Date Info */}
                <div className="snippet-list-metadata">
                  <span>By {snippet.author}</span>
                  <span className="metadata-separator">•</span>
                  <span>
                    {snippet.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                
                {/* View Details Link */}
                <Link
                  href={`/snippet/${snippet.id}`}
                  className="view-details-button"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}