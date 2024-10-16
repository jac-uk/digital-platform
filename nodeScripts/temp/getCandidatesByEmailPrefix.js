
/**
 * Gets a list of candidates by email prefix
 * Displays the users emailVerified status and whether they have completed registration or not
 * Eg you can get a list of all candidates whose email address begins with: 'test+'
 * Helpful when you want to identify and remove a bunch of test accounts
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript temp/getCandidatesByEmailPrefix.js
 *   ```
 */
'use strict';

import { auth, app, db } from '../shared/admin.js';

async function getCandidatePersonalDetails(uid) {
  const personalDetailsDoc = await db.collection('candidates').doc(uid).collection('documents').doc('personalDetails').get();
  if (personalDetailsDoc.exists) {
    return personalDetailsDoc.data(); // Return the personal details document data
  } else {
    console.log(`No personal details record found for UID: ${uid}`);
    return null;
  }
}

// Function to search users by email prefix and check emailVerified status
async function searchUsersByEmailPrefix(prefix) {
  let nextPageToken;

  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken); // List users in batches of 1000

    // Loop over users and process them directly
    for (const userRecord of listUsersResult.users) {
      if (userRecord.email.startsWith(prefix)) {
        console.log('User ID:', userRecord.uid);
        console.log('Email:', userRecord.email);

        if (userRecord.emailVerified) {

          console.log('************* EMAIL VERIFIED *************');

          const personalDetails = await getCandidatePersonalDetails(userRecord.uid);
          if (personalDetails) {
            
            const requiredFieldsComplete = personalDetails.dateOfBirth != null
            && personalDetails.email != null
            && personalDetails.firstName != null
            && personalDetails.lastName != null
            && personalDetails.title != null;

            if (requiredFieldsComplete) {
              console.log('************************** CANDIDATE FIELDS **************************');
            }
          }
        }
        
        if (userRecord.emailVerified) {
          console.log('=========================');
        }
        else {
          console.log('-------------------------');
        }
      }
    }

    nextPageToken = listUsersResult.pageToken; // Move to the next page of users
  } while (nextPageToken); // Continue paginating if there are more users
}

const main = async () => {
  return searchUsersByEmailPrefix('omar.jebari');
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });

