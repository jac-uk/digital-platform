/**
 * Delete all application data owned by the specified user.
 * This includes records from both `applications` and `applicants` Firestore collections.
 *
 * EXAMPLE USAGE:
 *   ```
 *   export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 *   node deleteApplicant.js <user email address>
 *   ```
 *
 * NOTE:
 *   This script will only run for users whose email address ends with
 *   judicialappointments.digital or judicialappointments.gov.uk
 */

const admin = require('firebase-admin');

const userEmail = process.argv[2];

// Validate the user email CLI argument
if (/^.+@judicialappointments\.(digital|gov\.uk)$/.test(userEmail) === false) {
  console.error('Specify a JAC email address');
  process.exit(1);
}

admin.initializeApp();
const firestore = admin.firestore();

const main = async () => {
  const user = await admin.auth().getUserByEmail(userEmail);

  const applicant = firestore
    .collection('applicants')
    .doc(user.uid);

  const applications = await firestore
    .collection('applications')
    .where('applicant', '==', applicant)
    .get();

  // Delete associated `application` records
  const deletePromises = applications.docs.map(snapshot => snapshot.ref.delete());

  // Delete `applicant` record
  deletePromises.push(applicant.delete());

  await Promise.all(deletePromises);

  console.log(`Application for user "${userEmail}" has been deleted`);
};

main()
  .then(() => {
    // Destroy the Firebase reference to allow the script to end
    admin.app().delete();
  });
