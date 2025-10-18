// Import function to generate fake restaurant data for testing
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firestore functions for database operations
import {
  collection, // Reference to a collection of documents
  onSnapshot, // Listen for real-time updates
  query, // Create database queries
  getDocs, // Fetch documents once
  doc, // Reference to a single document
  getDoc, // Fetch a single document
  updateDoc, // Update an existing document
  orderBy, // Sort query results
  Timestamp, // Firestore Timestamp data type
  runTransaction, // Execute multiple operations atomically
  where, // Filter query results
  addDoc, // Add new document to collection
  getFirestore, // Get a Firestore instance
} from "firebase/firestore";

// Import the Firestore database instance
import { db } from "@/src/lib/firebase/clientApp";

// Update a restaurant's image URl in Firestore
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Get reference to specific restaurant document
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // If document exists, update its photo field with the new image URL
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Function to update a restraurant's rating statistics and add a new review within a transaction
// Parameters:
// - transaction: The transaction object
// - docRef: The reference to the restaurant document
// - newRatingDocument: The reference to the new rating document
// - review: The new review data
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Retrieve the current restaurant document from the Firestore within the transaction
  const restaurant = await transaction.get(docRef);
  
  // Extract the document from the restaurant data 
  const data = restaurant.data();

  // Calculate the new total number of ratings
  // If newNumRatings exist, increment it by 1; otherwise, this is the first rating (set to 1)
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;

  // Calculate the new sum of all ratings
  // Add the current review's rating to existing sum (or 0 if no ratings exist)
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  
  // Calculate the new average rating by dividing total sum by total number of ratings
  const newAverage = newSumRating / newNumRatings;

  // Update the restaurant document with the new rating statistics
  transaction.update(docRef, {
    numRatings: newNumRatings,     //Updated total number of ratings
    sumRating: newSumRating,       //Updated sum of all rating values
    avgRating: newAverage,         //Updated average rating
  });

  // Create a new review document in the reviews subcollection
  transaction.set(newRatingDocument, {
    ...review,  // Spread operator to include all review data (rating, text, userId, userName)
    timestamp: Timestamp.fromDate(new Date()), // Add current timestamp to the review
  });
};

// Exported async function to add a review to a restaurant and update its rating statistics
// Parameters:
// - db: The Firestore database instance
// - restaurantId: The ID of the restaurant being reviewed
// - review: Object containing review data (rating, text, userId, userName)
export async function addReviewToRestaurant(db, restaurantId, review) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
          throw new Error("No restaurant ID has been provided.");
  }

  // Validate that review data was provided
  if (!review) {
          throw new Error("A valid review has not been provided.");
  }

  // Try-catch block to handle any errors during the review submission process
  try {
          // Create a reference to the specific restaurant document in the "restaurants" collection
          const docRef = doc(collection(db, "restaurants"), restaurantId);
          
          // Create a reference for the new review document in the "ratings" subcollection
          // Firestore will auto-generate an ID for this document
          const newRatingDocument = doc(
                  collection(db, `restaurants/${restaurantId}/ratings`)
          );

          // Execute a Firestore transaction to automically update both the restaurant and add the review
          // This ensures both operations succeed or both fail (no partial updates)
          // The transaction calls updateWithRating function to perform the updates
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          // Log the error to the console for debugging purposes
          console.error(
                  "There was an error adding the rating to the restaurant",
                  error
          );
          // Re-throw the error so calling code can handle it
          throw error;
  }
}

// Apply filtering and sorting to a firestore query
function applyQueryFilters(q, { category, city, price, sort }) {
  // Filter by restaurant category if specified
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Filter by restaurant city if specified
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // Filter by price level ($-$$$) if specified
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Sort by average rating (default) or number of reviews
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query
  return q;
}

// Fetch all restaurants from Firestore with optional filters
export async function getRestaurants(db = db, filters = {}) {
  // Create base query for restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply any filters (category, city, price, sort)
  q = applyQueryFilters(q, filters);
  // Execute the query and return the results
  const results = await getDocs(q);
 // Transform Firestore documents into plain JavaScript objects
  return results.docs.map((doc) => {
    return {
      id: doc.id,                     // Include the document ID
      ...doc.data(),                  // Spread all document feilds
      // Convert Firestore timestamp to JavaScript date for client compatibility
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Set up real-time updates for a restaurant updates
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that callback is actually a function
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create base query for restaurants collection
  let q = query(collection(db, "restaurants"));
  // Apply filters to query
  q = applyQueryFilters(q, filters);

  // Set up listener that triggers callback whenever data changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform each document into the snapshot
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,                     // Document ID
        ...doc.data(),                  // All document feilds
        // Convert timestamp for client compatibility
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Callback function with updated results
    cb(results);
  });
}

// Fetch a single restaurant by its ID
export async function getRestaurantById(db, restaurantId) {
  // Validate that restaurantId is valid
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  // Get reference to specific restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Fetch the document
  const docSnap = await getDoc(docRef);
  // Return document date with converted timestamp
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder for real-time listener for single restaurant (not implemented yet)
export function getRestaurantSnapshotById(restaurantId, cb) {
  return;
}

// Fetch all reviews for a specific restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate that restaurantId is valid
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create query for reviews subcollection, sorted by newest first
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute query
  const results = await getDocs(q);
  // Transform review documents into plain objects
  return results.docs.map((doc) => {
    return {
      id: doc.id,                     // Document ID
      ...doc.data(),                  // All document feilds
      // Convert timestamp for client compatibility
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Set up real-time listener for restaurant reviews
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate that restaurantId is valid
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create query for reviews subcollection
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  // Set up listener for review changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform review documents
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,                     // Document ID
        ...doc.data(),                  // All document feilds
        // Convert timestamp for client compatibility
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
}

// Add sample restaurants and reviews to database for testing
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurants and reviews
  const data = await generateFakeRestaurantsAndReviews();
  // Loop through each restaurant and review
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add restaurant document to Firestore
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add all reviews for this restaurant
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // log error if document creation fails
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
