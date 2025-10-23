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
 * Displays a filterable list of code snippets with AI-powered explanations
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
  // AI EXPLANATION STATE
  // ============================================
  
  // Store explanations for each snippet by ID
  // Example: { "snippet123": "This code does..." }
  const [explanations, setExplanations] = useState({});
  
  // Track which snippet is currently being explained (loading state)
  // Example: "snippet123" when that snippet's explanation is loading
  const [loadingExplanation, setLoadingExplanation] = useState(null);

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
  // AI EXPLANATION HANDLER
  // ============================================

  /**
   * Handles the "Explain Code" button click
   * Sends code to Gemini AI API and displays explanation
   * 
   * @param {Object} snippet - The snippet object to explain
   */
  const handleExplainCode = async (snippet) => {
    // Check if we already have an explanation for this snippet
    if (explanations[snippet.id]) {
      // If explanation exists, remove it (toggle off)
      const newExplanations = { ...explanations };
      delete newExplanations[snippet.id];
      setExplanations(newExplanations);
      return;
    }

    // Set loading state for this specific snippet
    setLoadingExplanation(snippet.id);

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
        // Store the explanation in state using snippet ID as key
        setExplanations((prev) => ({
          ...prev,
          [snippet.id]: data.explanation,
        }));
      } else {
        // Show error if API request failed
        alert(data.error || "Failed to explain code");
      }
    } catch (error) {
      // Handle any network or parsing errors
      console.error("Error explaining code:", error);
      alert("Failed to explain code. Please try again.");
    } finally {
      // Clear loading state regardless of success or failure
      setLoadingExplanation(null);
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading snippets...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN CONTENT
  // ============================================

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Code Snippet Manager</h1>
          <p className="text-gray-600">
            Browse and search through {snippets.length} code snippet{snippets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Add Snippet Button - only show if user is logged in */}
        {user && (
          <Link
            href="/add-snippet"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
          >
            + Add Snippet
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Framework
            </label>
            <select
              value={selectedFramework}
              onChange={handleFrameworkChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
            </label>
            <select
              value={selectedTag}
              onChange={handleTagChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Snippets List */}
      {snippets.length === 0 ? (
        // Empty State
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-yellow-800 font-semibold">No snippets found</p>
          <p className="text-yellow-700 mt-2">
            {selectedLanguage || selectedFramework || selectedTag
              ? "Try adjusting your filters"
              : "Add your first code snippet to get started!"}
          </p>
        </div>
      ) : (
        // Snippets Grid
        <div className="space-y-6">
          {snippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {/* Snippet Header */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">{snippet.title}</h3>
                <p className="text-gray-600">{snippet.description}</p>
              </div>

              {/* Tags/Badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {snippet.language}
                </span>
                {snippet.framework && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {snippet.framework}
                  </span>
                )}
                {snippet.tags && snippet.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Code Display */}
              <CodeDisplay code={snippet.code} language={snippet.language} />

              {/* AI Explanation Section */}
              {/* Show explanation if it exists for this snippet */}
              {explanations[snippet.id] && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    {/* Robot/AI Icon */}
                    <span className="text-2xl">🤖</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        AI Explanation
                      </h4>
                      {/* Display the explanation with preserved formatting */}
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {explanations[snippet.id]}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Snippet Footer with Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                {/* Author and Date Info */}
                <div className="text-sm text-gray-500">
                  <span>By {snippet.author}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {snippet.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                
                {/* Action Buttons Container */}
                <div className="flex gap-2">
                  {/* Explain Code Button */}
                  <button
                    onClick={() => handleExplainCode(snippet)}
                    disabled={loadingExplanation === snippet.id}
                    className={`
                      px-4 py-2 rounded-md transition-colors text-sm font-medium
                      ${
                        explanations[snippet.id]
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-purple-100 hover:bg-purple-200 text-purple-800"
                      }
                      ${
                        loadingExplanation === snippet.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {/* Show different text based on state */}
                    {loadingExplanation === snippet.id
                      ? "Explaining..." // Loading state
                      : explanations[snippet.id]
                      ? "Hide Explanation" // Explanation is showing
                      : "🤖 Explain Code"} {/* Default state */}
                  </button>

                  {/* View Details Link */}
                  <Link
                    href={`/snippet/${snippet.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}