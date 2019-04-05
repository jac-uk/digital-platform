/*
 *
 * To run:
 *
 * ```
 * export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 * cd functions
 * node createReferences.js
 * ```
 *
 * Create references for each assessor listed in submitted applications.
 *
 * References are stored in the `references` Firestore collection, and will hold the state of
 * Independent Assessments for each application.
 *
 */
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();

const getAssessors = async (application) => {
  const applicant = await application.get('applicant').get();
  const assessors = applicant.get('assessors');
  return (assessors instanceof Array) ? assessors : [];
};

const referenceExists = async (application, vacancy, assessor) => {
  const results = await firestore.collection('references')
    .where('application', '==', application.ref)
    .where('vacancy', '==', vacancy.ref)
    .where('assessor.email', '==', assessor.email)
    .get();
  return results.size > 0;
};

const createReference = async (application, vacancy, assessor) => {
  const applicant = await application.get('applicant').get();

  return firestore.collection('references').add({
    applicant_name: applicant.get('full_name'),
    application: application.ref,
    assessor: {
      email: assessor.email,
      name: assessor.name,
      phone: assessor.phone || null,
      position: assessor.position || null,
      relationship: assessor.relationship || null,
    },
    state: 'pending',
    type: assessor.type,
    vacancy: vacancy.ref,
    vacancy_title: vacancy.get('title'),
  });
};

const processApplication = async (application, vacancy) => {
  const assessors = await getAssessors(application);

  const promises = assessors.map(async (assessor) => {
    const alreadyExists = await referenceExists(application, vacancy, assessor);
    if (!alreadyExists) {
      const created = await createReference(application, vacancy, assessor);
      console.log(`Created reference ${created.id}`);
    }
  });

  return Promise.all(promises);
};

const main = async () => {
  const vacancyId = 'hsQqdvAfZpSw94X2B8nA'; // hardcoded for now
  const vacancy = await firestore.collection('vacancies').doc(vacancyId).get();

  const applications = await firestore.collection('applications')
    .where('vacancy', '==', vacancy.ref)
    .where('state', '==', 'submitted')
    .get();

  const promises = applications.docs.map((application) => {
    return processApplication(application, vacancy);
  });

  return Promise.all(promises);
};

main();
