/**
 * Next.js Configuration File
 * This file configures how Next.js builds and runs the application
 * It allows customization of build behavior, linting rules, and other settings
 */

// TypeScript type annotation for Next.js configuration
// This tells TypeScript what type of object nextConfig should be
/** @type {import('next').NextConfig} */

// Create the Next.js configuration object
// This object contains all the settings that customize how Next.js behaves
const nextConfig = {
  // ESLint configuration for the build process
  eslint: {
    // Disable ESLint during production builds
    // This prevents build failures due to linting errors
    // Useful when you want to deploy even with minor linting issues
    ignoreDuringBuilds: true,
  },
};

// Export the configuration object as the default export
// Next.js will automatically read this file and use these settings
module.exports = nextConfig;
