/*
 *
 * To run:
 *
 * ```
 * export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 * cd functions
 * node exportPendingReferences.js
 * ```
 *
 * Export a CSV file of pending references.
 *
 * The CSV is formatted to be compatible with the GOV.UK Notify template used for sending out
 * Independent Assessment request emails.
 *
 */
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const exportPath = 'pendingReferences.csv';

const csvWriter = createCsvWriter({
  header: [
    'email address',
    'applicant name',
    'assessor name',
    'download url',
    'upload url'
  ],
  path: exportPath,
});

const getReferences = async (vacancyRef) => {
  const references = await firestore.collection('references')
    .where('vacancy', '==', vacancyRef)
    .where('state', '==', 'pending')
    .get();
  return references.docs;
};

const generateCsvData = (references) => {
  return references.map((reference) => {
    const data = reference.data();
    return [
      data.assessor.email,
      data.applicant_name,
      data.assessor.name,
      'https://reference.judicialappointments.digital/download-form/128.docx', // hardcoded for now
      `https://reference.judicialappointments.digital/?ref=${reference.id}`
    ];
  });
};

const main = async () => {
  const vacancyId = 'hsQqdvAfZpSw94X2B8nA'; // hardcoded for now
  const vacancyRef = firestore.collection('vacancies').doc(vacancyId);

  const references = await getReferences(vacancyRef);
  const data = generateCsvData(references);

  await csvWriter.writeRecords(data);
  console.log(`Exported CSV to ${exportPath}`);
};

main();
