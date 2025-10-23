// ============================================
// IMPORTS
// ============================================

// Import Firebase Genkit and Google AI plugin
import { genkit } from 'genkit';
import { googleAI, gemini20Flash } from '@genkit-ai/googleai';

// Import Next.js server response utility
import { NextResponse } from "next/server";

// ============================================
// INITIALIZE GENKIT AI (PROFESSOR REQUIREMENT)
// ============================================

// Create Genkit AI instance with Google AI plugin and Gemini 2.0 Flash model
// This uses Firebase Genkit framework as required by the course
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY, // Use your existing env variable
    }),
  ],
  model: gemini20Flash, // Use Gemini 2.0 Flash as specified in tutorial
});

// ============================================
// API ROUTE: POST /api/explain-code
// ============================================

/**
 * POST Handler for Code Explanation API
 * 
 * This function receives code from the client, sends it to Gemini AI via
 * Firebase Genkit, and returns an AI-generated explanation.
 * 
 * @param {Request} request - The incoming HTTP request with code data
 * @returns {NextResponse} JSON response with explanation or error
 */
export async function POST(request) {
  try {
    // ============================================
    // STEP 1: EXTRACT DATA FROM REQUEST
    // ============================================
    
    // Parse the JSON body from the request
    // Expecting: { code: "...", language: "JavaScript" }
    const { code, language } = await request.json();

    // ============================================
    // STEP 2: VALIDATE INPUT
    // ============================================
    
    // Check if code was provided
    if (!code) {
      // Return error response if code is missing
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 } // 400 = Bad Request
      );
    }

    // ============================================
    // STEP 3: CREATE AI PROMPT
    // ============================================
    
    // Construct a detailed prompt that tells Gemini:
    // - What role to play (helpful coding assistant)
    // - What format we want (summary, concepts, improvements)
    // - The code to analyze
    const prompt = `
You are a helpful coding assistant. Explain the following ${language || "code"} snippet in a clear and concise way.

Provide:
1. A brief summary of what the code does (2-3 sentences)
2. Key concepts or techniques used
3. Any potential improvements or considerations

Code:
\`\`\`${language || ""}
${code}
\`\`\`

Keep the explanation beginner-friendly but technically accurate.
`;

    // ============================================
    // STEP 4: SEND REQUEST TO GEMINI VIA GENKIT
    // ============================================
    
    // Use Genkit's generate method (much simpler than direct SDK)
    const { text } = await ai.generate({
      prompt: prompt,
      config: {
        temperature: 0.7,      // Balance between creativity and consistency
        maxOutputTokens: 1000, // Limit response length (~750 words)
      },
    });

    // ============================================
    // STEP 5: RETURN SUCCESS RESPONSE
    // ============================================
    
    // Send back the explanation to the client
    return NextResponse.json({ 
      explanation: text,  // The AI-generated explanation text from Genkit
      success: true       // Flag indicating successful processing
    });

  } catch (error) {
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    // Log the error to the server console for debugging
    console.error("Error explaining code:", error);
    
    // Return error response to the client
    return NextResponse.json(
      { 
        error: "Failed to explain code. Please try again.",
        details: error.message  // Include error details for debugging
      },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}