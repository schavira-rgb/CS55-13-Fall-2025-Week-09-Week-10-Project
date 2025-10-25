/**
 * Utility functions for generating random data
 * These functions are used for creating fake restaurant data for testing
 */

/**
 * Generates a random integer between min and max (inclusive)
 * 
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 1000)
 * @returns {number} Random integer between min and max
 */
export function randomNumberBetween(min = 0, max = 1000) {
  // Generate random number between 0 and 1, multiply by range, add min, then floor to get integer
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generates a random date that is before the starting date
 * Used for creating fake restaurant creation dates
 * 
 * @param {Date} startingDate - The reference date (default: current date)
 * @returns {Date} Random date 20-80 days before the starting date
 */
export function getRandomDateBefore(startingDate = new Date()) {
  // Generate random number of days between 20 and 80
  const randomNumberOfDays = randomNumberBetween(20, 80);
  // Create new date by subtracting random days from starting date
  // Convert days to milliseconds: days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  const randomDate = new Date(
    startingDate - randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  // Return the calculated random date
  return randomDate;
}

/**
 * Generates a random date that is after the starting date
 * Used for creating fake review dates that come after restaurant creation
 * 
 * @param {Date} startingDate - The reference date (default: current date)
 * @returns {Date} Random date 1-19 days after the starting date
 */
export function getRandomDateAfter(startingDate = new Date()) {
  // Generate random number of days between 1 and 19
  const randomNumberOfDays = randomNumberBetween(1, 19);
  // Create new date by adding random days to starting date
  // Use getTime() to get milliseconds, then add the random days in milliseconds
  const randomDate = new Date(
    startingDate.getTime() + randomNumberOfDays * 24 * 60 * 60 * 1000
  );
  // Return the calculated random date
  return randomDate;
}
