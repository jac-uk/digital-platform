import { getDocuments, normaliseNINs } from '../../shared/helpers.js';

export default (firebase, db) => {

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
      NINs = normaliseNINs(nationalInsuranceNumbers);
    } else {
      return data;
    }

    // Iterate through the NINs - National Insurance Numbers
    let resultsFromNIN = NINs.map(async (singleNationalInsuranceNumber) => {
      if (singleNationalInsuranceNumber) {
        
        const candidates = await getDocuments(db.collection('candidates')
          .where('computed.nino', '==', singleNationalInsuranceNumber)
        );

        if (candidates.length > 0) {
          let resultsFromRecords = candidates.map(async (obj) => {
            const candidateID = obj.id;
            
            const applicationRecords = await getDocuments(db.collection('applicationRecords')
              .where('candidate.id', '==', candidateID));

            const applications = await getDocuments(db.collection('applications')
              .where('status', '!=', 'withdrawn')
              .where('userId', '==', candidateID));
            
              let applicationNationalInsuranceNumber;

              if (applications.length > 0) {
                applications.map(async (application) => {
                  applicationNationalInsuranceNumber = application.personalDetails && application.personalDetails.nationalInsuranceNumber ? application.personalDetails.nationalInsuranceNumber : singleNationalInsuranceNumber;
                });
              }

              if (applicationRecords.length > 0) {
              let applicationsFromRecords = applicationRecords.map(async (application) => {
                let returnObj = [];

                const applicationRecordFullName = application.candidate && application.candidate.fullName ? application.candidate.fullName : null;
                const applicationRecordGender = application.diversity && application.diversity.gender ? application.diversity.gender : null;
                const applicationRecordEthnicity = application.diversity && application.diversity.ethnicity ? application.diversity.ethnicity : null;
                const applicationRecordDisability = application.diversity && application.diversity.disability ? application.diversity.disability : null;

                returnObj = {
                  NINumber: applicationNationalInsuranceNumber,
                  name: applicationRecordFullName,
                  gender: applicationRecordGender,
                  ethnicity: applicationRecordEthnicity,
                  disability: applicationRecordDisability,
                  solicitor: null,
                  exerciseReferenceNumber: application.application.referenceNumber,
                  exerciseName: application.exercise.name,
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

};

