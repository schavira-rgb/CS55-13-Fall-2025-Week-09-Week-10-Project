// Import Gemini AI model and Google AI plugin from Genkit library
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
// Import the main Genkit framework for AI generation
import { genkit } from "genkit";
// Import function to fetch reviews from Firestore
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
// Import function to get authenticated Firebase app instance
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Import Firestore database functionality
import { getFirestore } from "firebase/firestore";

// Async server component that generates an AI summary of restaurant reviews
// Parameter: restaurantId - The ID of the restaurant to summarize reviews for
export async function GeminiSummary({ restaurantId }) {
  // Get the authenticated Firebase server app instance for the current user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch all reviews for this restaurant from Firestore database
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );

  // Define a separator character to distinguish between different reviews in the prompt
  const reviewSeparator = "@";
  
  // Create the prompt that will be sent to Gemini AI
  // This prompt instructs Gemini to create a one-sentence summary based on all reviews
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  // Try-catch block to handle any errors during AI generation
  try {
    // Verify that the Gemini API key environment variable is set
    if (!process.env.GEMINI_API_KEY) {
      // Throw error if API key is missing with instructions on how to set it
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit AI instance with Google AI plugin and Gemini 2.0 Flash model
    const ai = genkit({
      plugins: [googleAI()],      // Enable Google AI functionality
      model: gemini20Flash,         // Use Gemini 2.0 Flash as the default model
    });
    
    // Generate the summary text by sending the prompt to Gemini AI
    const { text } = await ai.generate(prompt);

    // Return JSX displaying the AI-generated summary
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    // Log any errors that occur during the AI generation process
    console.error(e);
    // Return error message to display to the user
    return <p>Error summarizing reviews.</p>;
  }
}

// Skeleton component to display while the AI summary is being generated
// Shows a loading state with a friendly message
export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}