"use client";

// ============================================
// IMPORTS
// ============================================

// Prism syntax highlighter component - the main highlighter engine
// We use "Prism" (not "Light") for full language support
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

// VS Code Dark Plus theme - makes code look like VS Code's dark theme
// This is imported from the ESM (ES Module) path for better Next.js compatibility
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// React hook for managing component state
// We'll use this to track if the copy button was clicked
import { useState } from "react";

/**
 * CodeDisplay Component
 * Displays code with syntax highlighting and a copy button
 * 
 * @param {string} code - The code string to display
 * @param {string} language - Programming language for syntax highlighting (default: "javascript")
 */
export default function CodeDisplay({ code, language = "javascript" }) {
  // State to track if code was copied (for button feedback)
  // Initially false, becomes true when copy button is clicked
  const [copied, setCopied] = useState(false);

  /**
   * Copies code to clipboard and shows feedback
   */
  const handleCopy = async () => {
    try {
      // Use modern Clipboard API to copy code to user's clipboard
      // This is async, so we use await
      await navigator.clipboard.writeText(code);
      
      // Update state to show "Copied!" feedback
      setCopied(true);
      
      // Reset button text back to "Copy Code" after 2 seconds (2000ms)
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // If clipboard API fails (rare), log the error
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="relative">
      {/* Header with language label and copy button */}
      <div className="flex justify-between items-center mb-2 px-1">
        {/* Language label - shows what programming language this is */}
        <span className="text-sm text-gray-500 font-mono uppercase">
          {language}
        </span>
        
        {/* Copy button - changes color and text when clicked */}
        <button
          onClick={handleCopy}
          className={`
            px-3 py-1 text-sm rounded transition-all duration-200
            ${copied 
              ? 'bg-green-600 text-white'  // Green when copied
              : 'bg-blue-600 hover:bg-blue-700 text-white'  // Blue normally
            }
          `}
          aria-label="Copy code to clipboard"
        >
          {/* Show checkmark when copied, otherwise show "Copy Code" */}
          {copied ? "✓ Copied!" : "Copy Code"}
        </button>
      </div>
      
      {/* Syntax-highlighted code block */}
      <SyntaxHighlighter
        language={language.toLowerCase()}  // Ensure lowercase for library compatibility
        style={vscDarkPlus}                // VS Code Dark+ theme
        customStyle={{
          borderRadius: "8px",             // Rounded corners
          padding: "20px",                 // Internal padding
          fontSize: "14px",                // Readable font size
          margin: 0,                       // Remove default margins
          maxHeight: "600px",              // Max height before scrolling
          overflow: "auto",                // Enable scrolling for long code
        }}
        showLineNumbers={true}             // Show line numbers on the left
        wrapLines={true}                   // Wrap long lines instead of horizontal scroll
        lineNumberStyle={{
          minWidth: "3em",                 // Minimum space for line numbers
          paddingRight: "1em",             // Space between line numbers and code
          color: "#858585",                // Gray color for line numbers
          userSelect: "none",              // Prevent selecting line numbers when copying
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}