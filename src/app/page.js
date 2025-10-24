// ============================================
// HOME PAGE - LANGUAGE CATEGORIES
// ============================================
// Shows language category cards as the main navigation
// Level 1 of the 3-level structure

import LanguageCategories from "@/src/components/LanguageCategories";

/**
 * Home page component - displays language category cards
 * Replaced SnippetListings with LanguageCategories for better organization
 */
export default function Home() {
  return (
    <main>
      <LanguageCategories />
    </main>
  );
}