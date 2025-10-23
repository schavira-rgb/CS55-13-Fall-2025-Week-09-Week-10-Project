// ============================================
// IMPORTS
// ============================================

// Import Google's Generative AI SDK for Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import Next.js server response utility
import { NextResponse } from "next/server";

// ============================================
// INITIALIZE GEMINI AI
// ============================================

// Create a new Gemini AI instance using the API key from environment variables
// The API key is stored securely in Firebase Secret Manager (GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================
// API ROUTE: POST /api/explain-code
// ============================================

/**
 * POST Handler for Code Explanation API
 * 
 * This function receives code from the client, sends it to Gemini AI,
 * and returns an AI-generated explanation of what the code does.
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
    // STEP 3: INITIALIZE GEMINI MODEL
    // ============================================
    
    // Get the Gemini
    // "gemini-1.5-flash" is optimized for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ============================================
    // STEP 4: CREATE AI PROMPT
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
    // STEP 5: SEND REQUEST TO GEMINI AI
    // ============================================
    
    // Send the prompt to Gemini and wait for response
    const result = await model.generateContent(prompt);
    
    // Extract the response from the result
    const response = await result.response;
    
    // Get the text explanation from the response
    const explanation = response.text();

    // ============================================
    // STEP 6: RETURN SUCCESS RESPONSE
    // ============================================
    
    // Send back the explanation to the client
    return NextResponse.json({ 
      explanation,      // The AI-generated explanation text
      success: true     // Flag indicating successful processing
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