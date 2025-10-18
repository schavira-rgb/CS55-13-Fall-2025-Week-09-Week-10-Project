"use client";

// This component shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

// Import React hooks for state management and side effects
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js dynamic import for code splitting
import dynamic from "next/dynamic";
// Import function to set up real-time listener for restaurant data
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import custom hook to get current user information
import { useUser } from "@/src/lib/getUser";
// Import component to display restaurant details
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
// Import function to handle restaurant image uploads to Firebase Storage
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Dynamically import ReviewDialog component to reduce initial bundle size
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Main Restaurant component - displays restaurant info and handles review dialog
// Props:
// - id: Restaurant ID
// - initialRestaurant: Initial restaurant data from server
// - initialUserId: Initial user ID from server
// - children: Child components (like review summary)
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // State to store current restaurant details (updates in real-time)
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  // State to control whether the review dialog is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Get current user ID, falling back to initial value if not available
  // Used to associate reviews with the user and control dialog visibility
  const userId = useUser()?.uid || initialUserId;
  
  // State to store the review being written by the user
  const [review, setReview] = useState({
    rating: 0,      // Star rating (0-5)
    text: "",       // Review text content
  });

  // Handler to update review state when user types or selects rating
  // Parameters:
  // - value: The new value for the field
  // - name: The field name to update ("rating" or "text")
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  // Async function to handle restaurant image upload
  // Parameter: target - The file input element containing the selected image
  async function handleRestaurantImage(target) {
    // Get the first file from the file input, or null if none selected
    const image = target.files ? target.files[0] : null;
    
    // Exit early if no image was selected
    if (!image) {
      return;
    }

    // Upload image to Firebase Storage and get the public URL
    const imageURL = await updateRestaurantImage(id, image);
    
    // Update local state with new image URL to display it immediately
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  // Handler to close the review dialog and reset the review form
  const handleClose = () => {
    setIsOpen(false);                    // Close the dialog
    setReview({ rating: 0, text: "" });  // Reset review form to empty state
  };

  // Set up real-time listener for restaurant data updates
  // Effect runs when component mounts and when restaurant ID changes
  useEffect(() => {
    // Subscribe to real-time updates for this restaurant
    // Returns cleanup function to unsubscribe when component unmounts
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);  // Update state when data changes in Firestore
    });
  }, [id]);  // Re-run effect if restaurant ID changes

  return (
    <>
      {/* Display restaurant details (image, name, ratings, etc.) */}
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {/* Render children (typically the AI summary and reviews list) */}
        {children}
      </RestaurantDetails>
      
      {/* Only show review dialog if user is logged in */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}