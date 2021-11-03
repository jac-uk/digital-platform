const axios = require('axios');
const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocument, getDocuments, getAllDocuments } = require('../../shared/helpers');

module.exports = (config, firebase, db) => {

  return transferHandoverData;

  /**
  * transferHandoverData
  * @param {*} `params` is an object containing
  *   `exerciseId` (required) ID of exercise
  */
  async function transferHandoverData(params) {

    const report = await getHandoverData(params.exerciseId);
    if (report.valid === true) {
      let handoverData = [];
      // construct body for API request
      report.data.forEach(row => handoverData.push(
        {
          id: row.candidateId,
          forenames: row.firstName,
          knownAs: row.otherNames,
          surname: row.lastName,
          title: row.title,
          homeEmailAddress: row.email,
          dateOfBirth: row.dateOfBirth,
          nINumber: row.nationalInsuranceNumber,
          citizenship: row.citizenship,
          addressLine1: row.addressLine1,
          addressLine2: row.addressLine2,
          addressLine3: row.addressLine3,
          addressLine4: row.addressLine4,
          postCode: row.addressLine5,
          homeTelephoneNo: row.phone,
          FIFText11: row.qualifications,
          FIFText16: row.professionalBackground,
          FIFText1: row.stateOrFeeSchool,
          FIFText4: row.firstGenerationStudent,
          ethnicOriginDescription: row.ethnicGroup,
          sex: row.gender,
          FIFText7: row.sexualOrientation,
          FIFText18: row.disability + ', ' + row.religionFaith,
          FIFText5: row.participatedInJudicialWorkshadowingScheme
        }));
      return handoverData;
    } else {
      return report;
     }

    //
    // const headers = {
    //   'headers': {'x-api-key': config.JO_KEY},
    //   'content-type': 'application/json'
    // };
    //
    // const url = "config.TEST_JO_URL;
    //
    // try {
    //   const response = await axios({
    //     method: 'post',
    //     headers: headers,
    //     url: url,
    //     data: handoverData,
    //   });
    //   console.log(response);
    //   if (response.status === 200) {
    // return 'Success!';
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
  }

  async function getHandoverData(exerciseId) {
    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get submitted application records at handover stage
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', 'handover')
    );

    // get applications
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    const report = reportData(db, exercise, applicationRecords, applications);

    // store the report document in the database
    //await db.collection('exercises').doc(exerciseId).collection('reports').doc('handover').set(report);

    // check data to ensure it is valid and return
    let invalidRefNumbers = [];

    report.forEach(function (item) {
      if (isEmpty(item)) {
        invalidRefNumbers.push(item.referenceNumber);
      }
    });

    if (invalidRefNumbers.length) {
      return { valid: false, invalidRefNumbers: invalidRefNumbers };
    }
    return { valid: true, data: report };
  }

  // Check whether data is valid
  function isEmpty(item) {
    const values = Object.values(item);
    return !!values.includes('' || undefined || null);
  }

  /**
   * Get the handover data for the given exercise and applications
   *
   * @param {db} db
   * @param {document} exercise
   * @param {array} applicationRecords
   * @param {array} applications
   * @returns {array}
   */
  function reportData(db, exercise, applicationRecords, applications) {
    return applications.map((application) => {

      // format qualifications
      let qualifications;
      if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
        qualifications = formatLegalData(application);
      }

      // return data for this application
      return {
        applicationId: application.id,
        referenceNumber: application.referenceNumber || null,
        candidateId: getCandidateId(applicationRecords, application),
        ...formatPersonalDetails(application.personalDetails),
        ...qualifications,
        ...formatDiversityData(application.equalityAndDiversitySurvey, exercise),
      };

    });
  }

  function formatLegalData(application) {
    const qualifications = application.qualifications.map(qualification => {
      return [
        lookup(qualification.location),
        lookup(qualification.type),
        helpers.formatDate(qualification.date),
        qualification.membershipNumber,
      ].join(', ');
    }).join('\n');

    return {
      qualifications: qualifications,
    };
  }

  function getCandidateId(applicationRecords, application) {
    const applicationRecord = applicationRecords.find(e => e.application.id === application.id);
    return applicationRecord.candidate.id;
  }

  function formatPersonalDetails(personalDetails) {
    return {
      firstName: personalDetails.firstName || null,
      otherNames: personalDetails.otherNames || null,
      lastName: personalDetails.lastName || null,
      title: personalDetails.title || null,
      email: personalDetails.email || null,
      dateOfBirth: helpers.formatDate(personalDetails.dateOfBirth),
      nationalInsuranceNumber: helpers.formatNIN(personalDetails.nationalInsuranceNumber),
      citizenship: lookup(personalDetails.citizenship),
      addressLine1: personalDetails.address.current.street || null,
      addressLine2: personalDetails.address.current.street2 || null,
      addressLine3: personalDetails.address.current.town || null,
      addressLine4: personalDetails.address.current.county || null,
      addressLine5: personalDetails.address.current.postcode || null,
      phone: personalDetails.phone || null,
    };
  }

  function formatDiversityData(survey, exercise) {
    const share = (value) => survey.shareData ? value : null;

    const formattedDiversityData = {
      professionalBackground: share(survey.professionalBackground.map(position => lookup(position)).join(', ')),
      stateOrFeeSchool: share(lookup(survey.stateOrFeeSchool)),
      firstGenerationStudent: share(helpers.toYesNo(lookup(survey.firstGenerationStudent))),
      ethnicGroup: share(lookup(survey.ethnicGroup)),
      gender: share(lookup(survey.gender)),
      sexualOrientation: share(lookup(survey.sexualOrientation)),
      disability: share(survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability)),
      religionFaith: share(lookup(survey.religionFaith)),
    };

    if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
      formattedDiversityData.participatedInJudicialWorkshadowingScheme = share(helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme)));
    }
    return formattedDiversityData;
  }
};
