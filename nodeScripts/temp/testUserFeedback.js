
/**
 * This script demonstrates how to prompt the user for feedback when running a script.
 * The script below checks if the user really wants to run this script.
 * If they confirm then it runs and if not it's cancelled.
 * 
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/testUserFeedback
 *   ```
 */
 'use strict';

// Import necessary modules
import readline from 'readline';

// Create an interface for reading from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt the user
const askConfirmation = () => {
  return new Promise((resolve) => {
    rl.question('Are you sure you want to run the script? (yes/no): ', (answer) => {
      resolve(answer.trim().toLowerCase() === 'yes'); // Check if the answer is 'yes'
    });
  });
};

const main = async () => {
  // Ask for confirmation
  const confirmed = await askConfirmation();
  rl.close();

  if (!confirmed) {
    console.log('Script execution cancelled.');
    process.exit(0); // Exit the script
  }

  // Continue with the rest of your script here
  console.log('Running the script...');
  // Your script logic goes here
};

// Run the main function
main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
