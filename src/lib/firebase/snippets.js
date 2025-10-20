// Firebase Firestore functions for managing code snippets
import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    Timestamp,
  } from "firebase/firestore";
  import { db } from "@/src/lib/firebase/clientApp";
  
  /**
   * Get all snippets with optional filters and real-time updates
   * @param {Object} filters - Filter options (language, framework, tag)
   * @param {Function} callback - Function called with updated snippets
   * @returns {Function} Unsubscribe function to stop listening
   */
  export function getSnippets(filters = {}, callback) {
    // Start with the snippets collection
    let q = collection(db, "snippets");
    
    // Apply language filter if provided
    if (filters.language) {
      q = query(q, where("language", "==", filters.language));
    }
    
    // Apply framework filter if provided
    if (filters.framework) {
      q = query(q, where("framework", "==", filters.framework));
    }
    
    // Apply tag filter if provided
    // array-contains checks if the tag exists in the tags array
    if (filters.tag) {
      q = query(q, where("tags", "array-contains", filters.tag));
    }
    
    // Sort by creation date (newest first) and limit to 50 results
    q = query(q, orderBy("createdAt", "desc"), limit(50));
    
    // Set up real-time listener
    // This will call the callback function whenever data changes
    return onSnapshot(q, (snapshot) => {
      const snippets = snapshot.docs.map((doc) => ({
        id: doc.id,           // Firestore document ID
        ...doc.data(),        // All the document fields
      }));
      callback(snippets);     // Send data to callback function
    });
  }
  
  /**
   * Get a single snippet by ID
   * @param {string} snippetId - The ID of the snippet to retrieve
   * @returns {Promise<Object>} The snippet data with ID
   */
  export async function getSnippet(snippetId) {
    // Create reference to the specific document
    const snippetRef = doc(db, "snippets", snippetId);
    
    // Fetch the document
    const snippetDoc = await getDoc(snippetRef);
    
    // Check if document exists
    if (snippetDoc.exists()) {
      return { 
        id: snippetDoc.id, 
        ...snippetDoc.data() 
      };
    } else {
      throw new Error("Snippet not found");
    }
  }
  
  /**
   * Add a new snippet to Firestore
   * @param {Object} snippetData - The snippet data to add
   * @returns {Promise<string>} The ID of the newly created snippet
   */
  export async function addSnippet(snippetData) {
    // Get reference to snippets collection
    const snippetsRef = collection(db, "snippets");
    
    // Create new snippet with timestamps
    const newSnippet = {
      ...snippetData,                 // All the snippet fields
      createdAt: Timestamp.now(),     // Current timestamp
      updatedAt: Timestamp.now(),     // Current timestamp
      rating: 0,                      // Initialize rating
      numRatings: 0,                  // Initialize number of ratings
    };
    
    // Add document to Firestore
    const docRef = await addDoc(snippetsRef, newSnippet);
    
    // Return the new document ID
    return docRef.id;
  }
  
  /**
   * Update an existing snippet
   * @param {string} snippetId - The ID of the snippet to update
   * @param {Object} snippetData - The updated snippet data
   */
  export async function updateSnippet(snippetId, snippetData) {
    // Get reference to specific document
    const snippetRef = doc(db, "snippets", snippetId);
    
    // Update the document with new data and updated timestamp
    await updateDoc(snippetRef, {
      ...snippetData,
      updatedAt: Timestamp.now(),
    });
  }
  
  /**
   * Delete a snippet
   * @param {string} snippetId - The ID of the snippet to delete
   */
  export async function deleteSnippet(snippetId) {
    // Get reference to specific document
    const snippetRef = doc(db, "snippets", snippetId);
    
    // Delete the document
    await deleteDoc(snippetRef);
  }
  
  /**
   * Get all unique programming languages from snippets
   * Used for populating filter dropdowns
   * @returns {Promise<Array<string>>} Sorted array of language names
   */
  export async function getLanguages() {
    const snippetsRef = collection(db, "snippets");
    const snapshot = await getDocs(snippetsRef);
    
    // Use a Set to automatically filter out duplicates
    const languages = new Set();
    
    // Loop through all snippets and collect languages
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.language) {
        languages.add(data.language);
      }
    });
    
    // Convert Set to Array and sort alphabetically
    return Array.from(languages).sort();
  }
  
  /**
   * Get all unique frameworks from snippets
   * Used for populating filter dropdowns
   * @returns {Promise<Array<string>>} Sorted array of framework names
   */
  export async function getFrameworks() {
    const snippetsRef = collection(db, "snippets");
    const snapshot = await getDocs(snippetsRef);
    
    // Use a Set to automatically filter out duplicates
    const frameworks = new Set();
    
    // Loop through all snippets and collect frameworks
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.framework) {
        frameworks.add(data.framework);
      }
    });
    
    // Convert Set to Array and sort alphabetically
    return Array.from(frameworks).sort();
  }
  
  /**
   * Get all unique tags from all snippets
   * Used for populating filter dropdowns
   * @returns {Promise<Array<string>>} Sorted array of tag names
   */
  export async function getAllTags() {
    const snippetsRef = collection(db, "snippets");
    const snapshot = await getDocs(snippetsRef);
    
    // Use a Set to automatically filter out duplicates
    const tags = new Set();
    
    // Loop through all snippets
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Check if tags field exists and is an array
      if (data.tags && Array.isArray(data.tags)) {
        // Add each tag to the set
        data.tags.forEach(tag => tags.add(tag));
      }
    });
    
    // Convert Set to Array and sort alphabetically
    return Array.from(tags).sort();
  }