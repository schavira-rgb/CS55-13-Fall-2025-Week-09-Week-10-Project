"use client";

// ============================================
// IMPORTS
// ============================================

// React hooks for managing state and side effects
import { useEffect, useState } from "react";

// Our Firebase function to get snippets from Firestore
import { getSnippets } from "@/src/lib/firebase/snippets";

// Our custom component to display code with syntax highlighting
import CodeDisplay from "@/src/components/CodeDisplay";

/**
 * Test Snippet Page
 * Displays snippets from Firestore to test our CodeDisplay component
 * This page will show all snippets with their code, title, description, etc.
 */
export default function TestSnippetPage() {
  // State to store the array of snippets from Firestore
  const [snippets, setSnippets] = useState([]);
  
  // State to track if we're still loading data
  const [loading, setLoading] = useState(true);
  
  // State to store any error messages
  const [error, setError] = useState(null);

  // useEffect runs once when component mounts (loads)
  // This is where we fetch data from Firebase
  useEffect(() => {
    // Set up real-time listener for snippets collection
    // getSnippets returns an "unsubscribe" function
    const unsubscribe = getSnippets(
      {},  // No filters - get all snippets
      (data) => {
        // This callback runs whenever data changes in Firestore
        setSnippets(data);      // Update snippets state
        setLoading(false);      // We're done loading
      }
    );

    // Cleanup function - runs when component unmounts (page closes)
    // This stops listening to Firestore updates
    return () => unsubscribe();
  }, []); // Empty dependency array = run once on mount

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading snippets...</div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // ============================================
  // EMPTY STATE
  // ============================================
  if (snippets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Test Snippet Display</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No snippets found!</p>
          <p className="text-sm mt-2">
            Make sure you added a test snippet in the Firestore Console.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS STATE - Display Snippets
  // ============================================
  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-2">Test Snippet Display</h1>
      <p className="text-gray-600 mb-8">
        Found {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
      </p>

      {/* Loop through all snippets and display each one */}
      {snippets.map((snippet) => (
        <div 
          key={snippet.id} 
          className="mb-8 p-6 bg-white rounded-lg shadow-lg"
        >
          {/* Snippet Title */}
          <h2 className="text-2xl font-bold mb-2">
            {snippet.title}
          </h2>

          {/* Snippet Description */}
          <p className="text-gray-600 mb-4">
            {snippet.description}
          </p>

          {/* Tags/Badges Section */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {/* Language Badge */}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {snippet.language}
            </span>

            {/* Framework Badge (if exists) */}
            {snippet.framework && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {snippet.framework}
              </span>
            )}

            {/* Individual Tag Badges */}
            {snippet.tags && snippet.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Code Display Component - The star of the show! */}
          <CodeDisplay 
            code={snippet.code} 
            language={snippet.language} 
          />

          {/* Metadata Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Author: {snippet.author}</span>
              <span>
                Created: {snippet.createdAt?.toDate().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}