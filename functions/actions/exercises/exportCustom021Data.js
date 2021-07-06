const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments } = require('../../shared/helpers');
const _ = require('lodash');

module.exports = (firebase, db) => {
  return exportCustom021Data;

  /**
   * Generates an export of all application contacts for the specified exercise
   * @param {uuid} exerciseId
   */
  async function exportCustom021Data(exerciseId) {

    // get applicationRecords
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', 'recommended')
    );

    // get applicationRecords ids
    const ids = [];
    applicationRecords.forEach(applicationRecord => ids.push(applicationRecord.id));

    // get applications with ids matching application records ids in the array
    let applications = null;
    try {
      applications = await getContentById(ids, 'applications');
    } catch(error) {
      return [`${error}`];
    }

    const headers = [
      'Reference number',
      'Status',
      'Name',
      'Email',
      'Phone number',
      'Date of Birth',
      'National Insurance Number',
      'Gender',
      'Disability',
      'Ethnic Group',
      'Current Legal Role',
      'Professional Background',
      'Held Fee-paid Judicial Role',
      'Attended UK State School',
      'First Generation Student',
      'First Assessor Name',
      'First Assessor Email',
      'First Assessor Phone',
      'Second Assessor Name',
      'Second Assessor Email',
      'Second Assessor Phone',
      'First-tier Tribunal, ranked preference',
    ];

    return {
      headers: headers,
      rows: contactsExport(applications),
    };

    function contactsExport (applications) {
        return applications.map((application) => {
          return {
            referenceNumber: application.referenceNumber,
            status: lookup(application.status),
            fullName: application.personalDetails.fullName,
            email: application.personalDetails.email,
            phone: application.personalDetails.phone,
            dob: helpers.formatDate(application.personalDetails.dateOfBirth),
            nationalInsuranceNumber: helpers.formatNIN(application.personalDetails.nationalInsuranceNumber),
            gender: lookup(application.equalityAndDiversitySurvey.gender),
            disability: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.disability)),
            ethnicGroup: lookup(application.equalityAndDiversitySurvey.ethnicGroup),
            currentLegalRole: helpers.flattenCurrentLegalRole(application.equalityAndDiversitySurvey),
            professionalBackground: helpers.flattenProfessionalBackground(application.equalityAndDiversitySurvey),
            heldFeePaidJudicialRole: helpers.heldFeePaidJudicialRole(application.equalityAndDiversitySurvey.feePaidJudicialRole),
            attendedUKStateSchool: helpers.toYesNo(helpers.attendedUKStateSchool(application.equalityAndDiversitySurvey)),
            firstGenerationStudent: helpers.toYesNo(lookup(application.equalityAndDiversitySurvey.firstGenerationStudent)),
            firstAssessorFullName: application.firstAssessorFullName,
            firstAssessorEmail: application.firstAssessorEmail,
            firstAssessorPhone: application.firstAssessorPhone,
            secondAssessorFullName: application.secondAssessorFullName,
            secondAssessorEmail: application.secondAssessorEmail,
            secondAssessorPhone: application.secondAssessorPhone,
            additionalWorkingPreferences: getAdditionalWorkingPreferences(application, 4),
          };
        });
      }

    function getAdditionalWorkingPreferences(application, option) {
      if (!application.additionalWorkingPreferences || application.additionalWorkingPreferences.length === 0 || !application.additionalWorkingPreferences[option]) {
        return 'not provided';
      }
      const additionalWorkingPreferenceData = application.additionalWorkingPreferences[option];

        if (Array.isArray(additionalWorkingPreferenceData.selection)) {
          if (additionalWorkingPreferenceData.selection.length === 0) {
            return 'not provided';
          }
          const answers = [];
          additionalWorkingPreferenceData.selection.forEach((choice, index) => {
            answers.push(`${index + 1}: ${choice}`);
          });
          return answers.join(',');
        } else {
          return additionalWorkingPreferenceData.selection;
        }
    }

    async function getContentById(ids, path) {
        // don't run if there aren't any ids or a path for the collection
        if (!ids || !ids.length || !path) {
          return [];
        }

        const collectionPath = db.collection(path);
        let batches = [];

        while (ids.length) {
          // firestore limits batches to 10
          const batch = ids.splice(0, 10);
          // add the batch request to to a queue
          batches.push(
            new Promise((resolve, reject) => {
              collectionPath
                .where(
                  firebase.firestore.FieldPath.documentId(),
                  'in',
                  [...batch]
                )
                .get()
                .then(results => resolve(results.docs.map(result => ({ ...result.data()}) )))
                .catch(e => reject(e));
            })
          );
        }
        //throw new Error('This is the error message');
        const content = await Promise.all(batches);
        return _.flatten(content);
    }
  }
};
