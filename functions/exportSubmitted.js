/*
 *
 * To run:
 *
 * ```
 * export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 * cd functions
 * node exportSubmitted.js
 * ```
 *
 * Exports applicant and application data for submitted applications.
 *
 * Do useful things with the output JSON using jq. For example:
 *
 * ```
 * cat submitted.json | jq -r '.[] | [.applicationId, .applicant.diversity_sharing_consent, .applicant.gender_same_as_birth,
 * .applicant.full_name, .applicant.ethnicity, .applicant.disability, .applicant.gender, .applicant.school_type,
 * (.applicant.professional_background | join(", "))] | @csv' > diversity_report.csv
 * ```
 *
 */
const fs = require('fs');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();
// This is deprecated and throws warnings.  For now, though, it is
// easier than trying to recursively parse the data structure looking for
// firestore Timestamps.
firestore.settings({timestampsInSnapshots: false});

const sortObject = (object) => {
  const newObject = {};
  Object.keys(object).sort().forEach((key) => {
    newObject[key] = object[key];
  });
  return newObject;
};

const getRecords = async () => {
  const applications = await firestore
    .collection('applications')
    .where('state', '==', 'submitted')
    .get();

  const getApplicants = [];
  applications.forEach((application) => {
    const docRef = application.get('applicant');
    getApplicants.push(docRef.get());
  });
  const applicants = await Promise.all(getApplicants);

  const records = [];
  applications.forEach((application) => {
    const applicant = applicants.find((applicant) => {
      return applicant.id === application.get('applicant').id;
    });

    const applicationData = application.data();
    delete applicationData.applicant;
    delete applicationData.vacancy;

    records.push({
      applicationId: application.id,
      application: sortObject(applicationData),
      applicant: sortObject(applicant.data()),
    });
  });

  return records;
};

const main = async () => {
  const records = await getRecords();
  const output = JSON.stringify(records, null, 2);
  const outputFile = './submitted.json';
  fs.writeFile(outputFile, output, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Submitted applications have been exported to ${outputFile}`);
  });
};

main();
