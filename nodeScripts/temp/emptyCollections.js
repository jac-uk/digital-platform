
/**
 * Clean collections, can specify in collections variable.
 * There are commented codes that contain collection list, can uncomment them to use.
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
import { projectId, environment, isProduction, db } from '../shared/admin.js';

const batchSize = 500;
const collections = [];

// Use this list for cleaning all collections except from deleted collection
// const collections = [
//   'applicationRecords',
//   'applications',
//   'applications_temp',
//   'assessments',
//   'bugReports',
//   'candidateForms',
//   'candidates',
//   'customReports',
//   'exercises',
//   'exercises_temp',
//   'invitations',
//   'messages',
//   'notes',
//   'notifications',
//   'panellists',
//   'panels',
//   'userInvitations',
//   'vacancies',
// ];

// Use this list for cleaning all deleted collections
// const collections = (await listCollections()).filter((c) => c.includes('deleted'))

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

/**
 * Clean documents of specified collection
 * 
 * @param {string} collectionPath 
 * @param {integer} batchSize 
 * @returns {integer} number of deleted documents
 */
async function cleanCollection(collectionPath, batchSize) {
  let count = 0;
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);
  let snapshot;
  do {
    snapshot = await query.get();
      // Delete documents in a batch
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      count += snapshot.size;

  } while (snapshot.size >= batchSize);

  return count;
}

/**
 * List collections
 * 
 * @returns {string}
 */
// async function listCollections() {
//   const collectionRefs = await db.listCollections();
//   return collectionRefs.map(c => c.id);
// }
const main = async () => {
  console.log(chalk.green(`* Project Id: ${projectId}`));
  console.log(chalk.green(`* Environment: ${environment}`));
  console.log(chalk.green(`* Is Production: ${isProduction}`));
  const collectionList = collections.map((c) => `\n    - ${c}`).join();
  console.log(chalk.green(`* Collections:${collectionList}`));

  // Not execute in production
  if (isProduction) {
    console.log(chalk.red('You are trying to modify data on production environment, the execution cancelled to prevent from unexpected changes.'));
    process.exit(0); // Exit the script
  }

  const question = `You are cleaning the data on the ${environment}, Are you sure you want to continue? (yes/no): `;
  // Ask for confirmation
  const confirmed = await askConfirmation(question);
  rl.close();

  if (!confirmed) {
    console.log('Script execution cancelled.');
    process.exit(0); // Exit the script
  }
 
  // Clean collections
  for (const collection of collections) {
    console.log(`Cleaning collection: "${collection}" ...`);
    const count = await cleanCollection(collection, batchSize);
    console.log(`Deleted ${count} documents.`);
  }
 
};

// Run the main function
main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
