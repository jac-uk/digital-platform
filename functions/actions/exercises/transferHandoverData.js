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

    const validData = await getHandoverData(params.exerciseId);

    let handoverData = [];
    // construct body for API request
    validData.forEach(row => handoverData.push(
      {
        id: row.applicationId,
        Forenames: row.firstName,
        KnownAs: row.otherNames,
        Surname: row.lastName,
        Title: row.suffix,
        HomeEmailAddress: row.email,
        DateOfBirth: row.dateOfBirth,
        NINumber: row.nationalInsuranceNumber,
        AddressLine1: row.address1,
        AddressLine2: row.address2,
        AddressLine3: row.address3,
        AddressLine4: row.address4,
        Postcode: row.postCode,
        HomeTelephoneNo: row.phone,
        FIFText11: row.qualifications,
        FIFText16: row.professionalBackground,
        FIFText1: row.stateOrFeeSchool,
        FIFText4: row.attendedUniversity,
        EthnicOriginDescription: row.ethnicGroup,
        Sex: row.gender,
        FIFText7: row.sexualOrientation,
        FIFText18: row.disability + row.religionFaith,
        FIFText5: row.judicialExperience
      }));

    const headers = {
      'headers': {'x-api-key': config.JO_KEY},
      'content-type': 'application/json'
    };

    const url = "place url into config";

    try {
      const response = await axios({
        method: 'post',
        headers: headers,
        url: url,
        data: handoverData,
      });
      console.log(response);
      if (response.status === 200) {
    return 'Success!';
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getHandoverData(exerciseId) {
    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    // get submitted application records (which are at the handover stage)
    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('stage', '==', 'handover')
    );

    // get the parent application records for the above
    const applicationIds = applicationRecords.map(item => item.id);
    const applicationRefs = applicationIds.map(id => db.collection('applications').doc(id));
    const applications = await getAllDocuments(db, applicationRefs);

    // get report rows
    return reportData(db, exercise, applicationRecords, applications);

    // store the report document in the database
    //await db.collection('exercises').doc(exerciseId).collection('reports').doc('handover').set(report);

    // check data to ensure it is valid and return
    // let invalidDataReferenceNumbers = [];
    // rows.forEach(function (row) {
    //   if (isEmpty(row)) {
    //     invalidDataReferenceNumbers.push(row.referenceNumber);
    //   }
    // });
    //return rows.filter(row => invalidDataReferenceNumbers.includes(row.referenceNumber));
  }

  // Check whether data is valid
  function isEmpty(value) {
    return !Object.values(value).some(val => val !== null && val !== '');
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
      } else if (exercise.typeOfExercise === 'non-legal') {
        qualifications = formatNonLegalData(application);
      }

      // return data for this application
      return {
        applicationId: application.id,
        referenceNumber: application.referenceNumber || null,
        candidateId: getCandidateId(applicationRecords, application),
        ...formatPersonalDetails(application.personalDetails),
        ...qualifications,
        ...formatDiversityData(application.equalityAndDiversitySurvey),
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

    let judicialExperience;

    if (application.feePaidOrSalariedJudge) {
      judicialExperience = `Fee paid or salaried judge\n${lookup(application.feePaidOrSalariedSittingDaysDetails)}`;
    } else if (application.declaredAppointmentInQuasiJudicialBody) {
      judicialExperience = `Quasi-judicial body\n${lookup(application.quasiJudicialSittingDaysDetails)}`;
    } else {
      judicialExperience = `Acquired skills in other way\n${lookup(application.skillsAquisitionDetails)}`;
    }

    return {
      qualifications: qualifications,
      judicialExperience: judicialExperience,
    };
  }

  function formatNonLegalData(application) {
    const organisations = {
      'chartered-association-of-building-engineers': 'charteredAssociationBuildingEngineers',
      'chartered-institute-of-building': 'charteredInstituteBuilding',
      'chartered-institute-of-environmental-health': 'charteredInstituteEnvironmentalHealth',
      'general-medical-council': 'generalMedicalCouncilDate',
      'royal-college-of-psychiatrists': 'royalCollegeOfPsychiatrist',
      'royal-institution-of-chartered-surveyors': 'royalInstitutionCharteredSurveyors',
      'royal-institute-of-british-architects': 'royalInstituteBritishArchitects',
      'other': 'otherProfessionalMemberships',
    };

    if (application.professionalMemberships) {
      const professionalMemberships = application.professionalMemberships.map(membership => {
        let formattedMembership;
        if (organisations[membership]) {
          const fieldName = organisations[membership];
          formattedMembership = `${lookup(membership)}, ${helpers.formatDate(application[`${fieldName}Date`])}, ${application[`${fieldName}Number`]}`;
        }
        if (application.memberships[membership]) {
          const otherMembershipLabel = this.exercise.otherMemberships.find(m => m.value === membership).label;
          formattedMembership = `${lookup(otherMembershipLabel)}, ${helpers.formatDate(application.memberships[membership].date)}, ${application.memberships[membership].number}`;
        }
        return formattedMembership;
      }).join('\n');

      return {
        professionalMemberships: professionalMemberships,
      };
    } else {
      return {
        professionalMemberships: null,
      };
    }
  }

  function getCandidateId(applicationRecords, application) {
    const applicationRecord = applicationRecords.find(e => e.application.id === application.id);
    return applicationRecord.candidate.id;
  }

  function formatPersonalDetails(personalDetails) {
    const formatAddress = (address => [
        address.street1,
        address.street2,
        address.town,
        address.county,
        address.postcode,
      ].join('\n')
    );

    let formattedPreviousAddresses;
    if (personalDetails.address && !personalDetails.address.currentMoreThan5Years) {
      formattedPreviousAddresses = personalDetails.address.previous.map((address) => {
        const dates = `${helpers.formatDate(address.startDate)} - ${helpers.formatDate(address.endDate)}`;
        const formattedAddress = formatAddress(address);
        return `${dates}\n${formattedAddress}`;
      }).join('\n\n');
    }

    return {
      title: personalDetails.title || null,
      fullName: personalDetails.fullName || null,
      otherNames: personalDetails.otherNames || null,
      suffix: personalDetails.suffix || null,
      email: personalDetails.email || null,
      dateOfBirth: helpers.formatDate(personalDetails.dateOfBirth),
      nationalInsuranceNumber: helpers.formatNIN(personalDetails.nationalInsuranceNumber),
      citizenship: lookup(personalDetails.citizenship),
      address: personalDetails.address ? formatAddress(personalDetails.address.current) : null,
      previousAddresses: formattedPreviousAddresses || null,
      phone: personalDetails.phone || null,
    };
  }

  function formatDiversityData(survey) {
    const share = (value) => survey.shareData ? value : null;

    let formattedFeePaidJudicialRole;
    if (survey.shareData) {
      formattedFeePaidJudicialRole = helpers.toYesNo(lookup(survey.feePaidJudicialRole));
      if (survey.feePaidJudicialRole === 'other-fee-paid-judicial-office') {
        formattedFeePaidJudicialRole = `${formattedFeePaidJudicialRole}\n${survey.otherFeePaidJudicialRoleDetails}`;
      }
  }

    const formattedDiversityData = {
      shareData: helpers.toYesNo(survey.shareData),
      professionalBackground: share(survey.professionalBackground.map(position => lookup(position)).join(', ')),
      formattedFeePaidJudicialRole: formattedFeePaidJudicialRole || null,
      stateOrFeeSchool: share(lookup(survey.stateOrFeeSchool)),
      firstGenerationStudent: share(helpers.toYesNo(lookup(survey.firstGenerationStudent))),
      ethnicGroup: share(lookup(survey.ethnicGroup)),
      gender: share(lookup(survey.gender)),
      sexualOrientation: share(lookup(survey.sexualOrientation)),
      disability: share(survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability)),
      religionFaith: share(lookup(survey.religionFaith)),
      attendedOutreachEvents : share(helpers.toYesNo(lookup(survey.attendedOutreachEvents))),
    };

    if (this.exerciseType === 'legal' || this.exerciseType === 'leadership') {
      formattedDiversityData.participatedInJudicialWorkshadowingScheme = share(helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme)));
      formattedDiversityData.hasTakenPAJE = share(helpers.toYesNo(lookup(survey.hasTakenPAJE)));
    }

    return formattedDiversityData;
  }
};
