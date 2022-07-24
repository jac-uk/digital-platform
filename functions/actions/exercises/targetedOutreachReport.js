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
    let resultsFromNIN = NINs.map(async (singleNationalInsuranceNumber) => {
      if (singleNationalInsuranceNumber) {
        
        const candidates = await getDocuments(db.collection('candidates')
          .where('computed.search', 'array-contains', singleNationalInsuranceNumber)
        );

        if (candidates.length > 0) {
          let resultsFromRecords = candidates.map(async (obj) => {
            const candidateID = obj.id;
            const applicationRecords = await getDocuments(db.collection('applicationRecords')
              .where('candidate.id', '==', candidateID));

            if (applicationRecords.length > 0) {
              let applicationsFromRecords = applicationRecords.map(async (application) => {
                let returnObj = [];

                const applicationRecordFullName = application.candidate && application.candidate.fullName ? application.candidate.fullName : null;
                const applicationRecordGender = application.diversity && application.diversity.gender ? application.diversity.gender : null;
                const applicationRecordEthnicity = application.diversity && application.diversity.ethnicity ? application.diversity.ethnicity : null;
                const applicationRecordDisability = application.diversity && application.diversity.disability ? application.diversity.disability : null;

                returnObj = {
                  NINumber: singleNationalInsuranceNumber,
                  name: applicationRecordFullName,
                  gender: applicationRecordGender,
                  ethnicity: applicationRecordEthnicity,
                  disability: applicationRecordDisability,
                  solicitor: null,
                  exercise: `${application.exercise.id} - ${application.exercise.name}`,
                  stage: application.stage,
                  status: application.status,
                  id: candidateID,
                };    
                data.push(returnObj);
              });
              applicationsFromRecords = await Promise.all(applicationsFromRecords);
            }
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

