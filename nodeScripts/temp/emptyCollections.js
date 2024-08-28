
/**
 * Clean collections, can specify in collections variable
 * 
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/emptyCollections
 *   ```
 */
 'use strict';

// Import necessary modules
import readline from 'readline';
import chalk from 'chalk';
import { app, projectId, environment, isProduction } from '../shared/admin.js';

const collections = [

];

// Create an interface for reading from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt the user
const askConfirmation = (question) => {
  return new Promise((resolve) => {
    rl.question(chalk.yellow(question), (answer) => {
      resolve(answer.trim().toLowerCase() === 'yes'); // Check if the answer is 'yes'
    });
  });
};

const main = async () => {
  console.log('ProjectId', projectId)
  console.log('Environment:', environment)
  console.log('isProduction', isProduction)
  if (isProduction) {
    console.log(chalk.red('You are trying to modify data on production environment, the execution cancelled to prevent from unexpected changes.'));
    process.exit(0); // Exit the script
  }

  const question = `You are cleaning the data of the ${environment} (Project id: ${projectId}), Are you sure you want to continue? (yes/no): `
  // Ask for confirmation
  const confirmed = await askConfirmation(question);
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
