const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {

  return {
    targetedOutreachReport,
  };

  /**
  * targetedOutreachReport
  * *
  * @param [*] `nationalInsuranceNumbers` (required) Array list
  */
  async function targetedOutreachReport(nationalInsuranceNumbers) {
    
    let NINs = []; // store normalized National Insurance Numbers
    let data = []; // store the returned data in an Array

    // Normalize the National Insurance Numbers
    if (nationalInsuranceNumbers) {
      NINs = normalizeNINs(nationalInsuranceNumbers);
    } else {
      return data;
    }

    // Iterate through the NINs - National Insurance Numbers
    let resultsFromNIN = NINs.map(async (value) => {
      if (value) {
        let returnObj = [];
        let applications = await getDocuments(db.collection('applications')
          .where('personalDetails.nationalInsuranceNumber', '==', value)
        );
        
        if (applications.length > 0) {

          let resultsFromRecords = applications.map(async (obj) => {
            const applicationID = obj.id;
            // get the diversity values from Application Records
            const applicationRecord = await getDocument(db.collection('applicationRecords').doc(applicationID));

            const applicationRecordGender = applicationRecord.diversity && applicationRecord.diversity.gender ? applicationRecord.diversity.gender : null;
            const applicationRecordEthnicity = applicationRecord.diversity && applicationRecord.diversity.ethnicity ? applicationRecord.diversity.ethnicity : null;
            const applicationRecordDisability = applicationRecord.diversity && applicationRecord.diversity.disability ? applicationRecord.diversity.disability : null;

            returnObj = {
              NINumber: value,
              name: obj.personalDetails.fullName,
              gender: applicationRecordGender,
              ethnicity: applicationRecordEthnicity,
              disability: applicationRecordDisability,
              solicitor: null,
              exercise: `${obj.exerciseId} - ${obj.exerciseName}`,
              stage: applicationRecord.stage,
              status: obj.status,
              id: obj.id,
            };    
            data.push(returnObj);
          });

          resultsFromRecords = await Promise.all(resultsFromRecords);
          return true;
        }
      }
      return true;
    });

    resultsFromNIN = await Promise.all(resultsFromNIN); // Wait for the promises to fulfill before showing the results (data)
    return data;    
  }

  function normalizeNINs(nins) {
    return nins.map(nin => normalizeNIN(nin));
  }

  function normalizeNIN(nin) {
    return nin.replace(/-|\s/g,'').trim(); //replace hyphens and spaces inside and on the outer side
  }
};

