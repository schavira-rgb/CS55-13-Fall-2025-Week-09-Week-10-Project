// Import Firebase Storage functions for file upload operations
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the Firebase Storage instance from the client app configuration
import { storage } from "@/src/lib/firebase/clientApp";

// Import function to update the restaurant's image URl in Firestore database
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// Exported async function to update a restaurant's image in Firebase Storage and Firestore
// Parameters:
// - restaurantId: The ID of the restaurant being updated
// - image: The image file to be uploaded
export async function updateRestaurantImage(restaurantId, image) {
    try {
      // Validate that restaurantId is provided
      if (!restaurantId) {
        throw new Error("No restaurant ID has been provided.");
      }
  
      // Validate that a valid image file with a name property is provided
      if (!image || !image.name) {
        throw new Error("A valid image has not been provided.");
      }
  
      // Upload the image to Firebase Storage and get the public URL
      const publicImageUrl = await uploadImage(restaurantId, image);
      
      // Update the restaurant document in Firestore database with the new image URL
      await updateRestaurantImageReference(restaurantId, publicImageUrl);
  
      // Return the public image URL so it can be used to display the image immediately
      return publicImageUrl;
    } catch (error) {
        // Log any errors that occur during the image upload process
        console.error("Error processing request:", error);
    }
  }
  
  // Private async function to upload the image to Firebase Storage
  // Parameters:
  // - restaurantId: The ID of the restaurant being updated
  // - image: The image file to be uploaded
  async function uploadImage(restaurantId, image) {
    // Create the file path in Storage: images/[restaurantId]/[filename]
    // This organizes images by restaurant in the Storage bucket
    const filePath = `images/${restaurantId}/${image.name}`;
    
    // Create a reference to the location in Firebase Storage where the image will be stored
    const newImageRef = ref(storage, filePath);
    
    // Upload the image to Firebase Storage with resumable upload
    // Resumable uploads are better for larger files and can handle interuptions 
    await uploadBytesResumable(newImageRef, image);
  
    // Get and return the public download URL for the uploaded image
    // This URL can be stored in Firestore and used to display the image
    return await getDownloadURL(newImageRef);
  }