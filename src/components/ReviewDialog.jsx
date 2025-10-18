"use client";

// This component handles the review dialog and uses a Next.js feature known as Server Actions to handle the form submission

// Import React hooks for managing component lifecycle and references
import { useEffect, useLayoutEffect, useRef } from "react";
// Import component for star rating selection
import RatingPicker from "@/src/components/RatingPicker.jsx";
// Import server action to handle form submission
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// ReviewDialog component - displays a modal dialog for submitting restaurant reviews
// Props:
// - isOpen: Boolean controlling whether dialog is visible
// - handleClose: Function to close the dialog
// - review: Object containing current review data (rating, text)
// - onChange: Function to update review data as user types
// - userId: Current user's ID to associate with the review
// - id: Restaurant ID being reviewed
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  // Create a ref to access the native HTML dialog element
  const dialog = useRef();

  // Use layout effect to show/hide dialog before browser paints
  // This prevents visual flickering when opening/closing the dialog
  useLayoutEffect(() => {
    if (isOpen) {
      // showModal() displays the dialog with a backdrop
      dialog.current.showModal();
    } else {
      // close() hides the dialog
      dialog.current.close();
    }
  }, [isOpen, dialog]);  // Re-run when isOpen changes

  // Handler to close dialog when user clicks outside the modal content
  // Parameter: e - The mouse event object
  const handleClick = (e) => {
    // Check if the click target is the dialog backdrop (not the content inside)
    if (e.target === dialog.current) {
      handleClose();  // Close the dialog
    }
  };

  return (
    // Native HTML dialog element with backdrop dismissal
    <dialog ref={dialog} onMouseDown={handleClick}>
      {/* Form using Next.js Server Action for submission */}
      <form
        action={handleReviewFormSubmission}  // Server action to process the review
        onSubmit={() => {
          handleClose();  // Close dialog after submission
        }}
      >
        {/* Dialog header */}
        <header>
          <h3>Add your review</h3>
        </header>
        
        {/* Dialog content area */}
        <article>
          {/* Star rating picker component */}
          <RatingPicker />

          {/* Text input for review content */}
          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required                           // Field must be filled before submission
              value={review.text}                // Controlled input - value from state
              onChange={(e) => onChange(e.target.value, "text")}  // Update state on change
            />
          </p>

          {/* Hidden field to pass restaurant ID to server action */}
          <input type="hidden" name="restaurantId" value={id} />
          
          {/* Hidden field to pass user ID to server action */}
          <input type="hidden" name="userId" value={userId} />
        </article>
        
        {/* Dialog footer with action buttons */}
        <footer>
          <menu>
            {/* Cancel button - resets form and closes dialog */}
            <button
              autoFocus                         // Automatically focused when dialog opens
              type="reset"                      // Resets form fields
              onClick={handleClose}             // Close dialog without submitting
              className="button--cancel"
            >
              Cancel
            </button>
            
            {/* Submit button - sends review to server */}
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

// Export the component as default export
export default ReviewDialog;