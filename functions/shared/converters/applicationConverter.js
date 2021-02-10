// TODO sort out firestore date formatting

const htmlWriter = require('../htmlWriter');
const lookup = require('./lookup');
const {addField, formatDate, toDateString, toYesNo} = require('./helpers');

module.exports = () => {

  return {
    getHtmlPanelPack,
    // TODO include other converters
  };

  function getHtmlPanelPack(application, exercise, params) {

    const html = new htmlWriter();

    // sifts are name-blind, selection days include names(?)
    html.addTitle(`${application.personalDetails.fullName} ${application.referenceNumber}`);

    if (exercise.welshRequirement) {
      html.addHeading('Welsh posts');
      html.addTable(getWelshData(application));
    }

    function getWelshData(application) {
      const data = [];
      addField(data, 'Applying for Welsh posts', toYesNo(application.applyingForWelshPost));
      if (application.applyingForWelshPost) {
        addField(data, 'Can speak Welsh?', toYesNo(application.canSpeakWelsh));

        if (application.canReadAndWriteWelsh === false) {
          addField(data, 'Can write and read in Welsh?', toYesNo(application.canReadAndWriteWelsh));
        }

        if (application.canReadAndWriteWelsh) {
          addField(data, 'Can write and read in Welsh?', lookup(application.canReadAndWriteWelsh));
        }
      }
      return data;
    }

    if (application.additionalWorkingPreferences && application.additionalWorkingPreferences.length) {
      html.addHeading('Additional Preferences');
      html.addTable(getAdditionalWorkingPreferences(application, exercise));
    }

    function getAdditionalWorkingPreferences(application, exercise) {
      const additionalWorkingPreferenceData = application.additionalWorkingPreferences;
      const data = [];
      additionalWorkingPreferenceData.forEach((item, index) => {
        addField(data, lookup(exercise.additionalWorkingPreferences[index].questionType));
        if (exercise.additionalWorkingPreferences[index].questionType === 'single-choice') {
          addField(data, exercise.additionalWorkingPreferences[index].question, additionalWorkingPreferenceData.selection);
        }
        if (exercise.additionalWorkingPreferences[index].questionType === 'multiple-choice') {
          addField(data, exercise.additionalWorkingPreferences[index].question, `options: ${exercise.additionalWorkingPreferences[index].answers}`, `answer: ${item.selection}`);
        }
        if (exercise.additionalWorkingPreferences[index].questionType === 'ranked-choice') {
          const rankedAnswer = [];
          item.selection.forEach((choice, index) => {
            rankedAnswer.push(`${index + 1}: ${choice}`);
          });
          addField(data, exercise.additionalWorkingPreferences[index].question, `answer: ${rankedAnswer}`);
        }
      });
      return data;
    }

    if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
      html.addHeading('Qualifications');
      html.addTable(getQualificationData(exercise, application));
    }

    function getQualificationData(exercise, application) {
      const qualificationData = application.qualifications;
      const data = [];
      qualificationData.forEach(q => {
        addField(data, 'Qualification', lookup(q.type));
        addField(data, 'Location', lookup(q.location));

        if (q.date) {
          if (q.type === 'barrister') {
            addField(data, 'Date completed pupillage', formatDate(q.date));
          } else {
            addField(data, 'Date qualified', formatDate(q.date));
          }
        }
        if (q.qualificationNotComplete && q.details) {
          addField(data, 'Completed pupillage', 'No');
          addField(data, 'Did not complete pupillage notes', q.details);
        }
      });

      if (exercise.schedule2Apply) {
        if (exercise.appliedSchedule === 'schedule-2-3') {
          addField(data, 'Are you applying under Schedule 2(3)?', toYesNo(application.applyingForSchedule2Three));
        }
        if (exercise.appliedSchedule === 'schedule-2-d') {
          addField(data, 'Are you applying under Schedule 2(d)?', toYesNo(application.applyingUnderSchedule2d));
        }
        if ((exercise.appliedSchedule === 'schedule-2-3' && application.applyingUnderSchedule2Three)
          || (exercise.appliedSchedule === 'schedule-2-d' && application.applyingUnderSchedule2d)) {

          if (exercise.appliedSchedule === 'schedule-2-3') {
            addField(data, 'Explain how you\'ve gained experience in law', application.experienceUnderSchedule2Three);
          }
          if (exercise.appliedSchedule === 'schedule-2-d') {
            addField(data, 'Explain how you\'ve gained experience in law', application.experienceUnderSchedule2D);
          }
        }
      }
      return data;
    }

    if (exercise.typeOfExercise === 'non-legal' || exercise.typeOfExercise === 'leadership-non-legal') {
      html.addHeading('Experience');
      html.addTable(getExperienceData(application));
    }

    function getExperienceData(application) {
      const experienceData = application.experience;
      const data = [];
      experienceData.forEach(eD => {
        addField(data, 'Organisation or business', eD.orgBusinessName);
        addField(data, 'Job title', eD.jobTitle);
        addField(data, 'Date qualified', `${formatDate(eD.startDate)} - ${formatDate(eD.endDate) || 'current'}`);
      });
      return data;
    }

    if (exercise.typeOfExercise === 'legal') {
      html.addHeading('Post-qualification experience');
      html.addTable(getPostQualificationData(application));
    }

    function getPostQualificationData(application) {
      const experienceData = application.experience;
      const data = [];
      if (experienceData && experienceData.length) {
        experienceData.forEach((e, idx) => {
          addField(data, 'Job title', e.jobTitle, idx !== 0);
          addField(data, 'Organisation or business', e.orgBusinessName);
          addField(data, 'Dates worked', `${formatDate(e.startDate)} - ${formatDate(e.endDate) || 'current'}`);
          addField(data, 'Law related tasks', formatLawRelatedTasks(e));
        });
      }
      return data;
    }

    if ((exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') && exercise.previousJudicialExperienceApply) {
      html.addHeading('Judicial experience');
      html.addTable(getJudicialExperience(application));
    }

    function getJudicialExperience(application) {
      const data = [];
      addField(data, 'Fee-paid or salaried judge', lookup(toYesNo(application.feePaidOrSalariedJudge)));
      if (application.feePaidOrSalariedJudge === true) {
        addField(data, `Sat for at least ${application.pjeDays || 30} days`, toYesNo(application.feePaidOrSalariedSatForThirtyDays));
        if (application.feePaidOrSalariedSittingDaysDetails) {
          addField(data, 'Details', application.feePaidOrSalariedSittingDaysDetails);
        }
      }
      if (application.feePaidOrSalariedSatForThirtyDays === false || application.feePaidOrSalariedJudge === false) {
        addField(data, 'Declared an appointment or appointments in a quasi-judicial body in this application', toYesNo(application.declaredAppointmentInQuasiJudicialBody));
        if (application.declaredAppointmentInQuasiJudicialBody === true) {
          addField(data, `Sat for at least ${application.pjeDays || 30} days in one or all of these appointments`, toYesNo(application.quasiJudicialSatForThirtyDays));
          if (application.quasiJudicialSittingDaysDetails) {
            addField(data, 'Details', application.quasiJudicialSittingDaysDetails);
          }
        }
      }
      if (application.declaredAppointmentInQuasiJudicialBody === false || application.quasiJudicialSatForThirtyDays === false) {
        addField(data, 'Skills acquisition details', application.skillsAquisitionDetails);
      }
      return data;
    }

    // not required for non-legal
    if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
      html.addHeading('Employment gaps');
      if (application.employmentGaps && application.employmentGaps.length > 0) {
        html.addTable(getEmploymentGaps(application));
      } else {
        html.addParagraph('No Gaps in Employment declared');
      }
    }

    function getEmploymentGaps(application) {
      const employmentGapsData = application.employmentGaps;
      const data = [];
      employmentGapsData.forEach((eG, idx) => {
        addField(data, 'Date of gap', `${formatDate(eG.startDate)} - ${formatDate(eG.endDate)}`);
        addField(data, 'Details', eG.details);
        addField(data, 'Law related tasks', formatLawRelatedTasks(eG));
      });
      return data;
    }

    if (application.selectionCriteriaAnswers) {
      html.addHeading('Additional selection criteria');
      html.addTable(getAdditionalSelectionCriteria(application));
    }

    function getAdditionalSelectionCriteria(application) {
      const additionalSelectionCriteria = application.selectionCriteriaAnswers;
      const data = [];
      additionalSelectionCriteria.forEach(sC => {
        addField(data, sC.title, sC.answerDetails || 'Does not meet this requirement');
      });
      return data;
    }

    if (application.jurisdictionPreferences && application.jurisdictionPreferences.length) {
      html.addHeading('Jurisdiction Preferences');
      html.addTable(getJurisdictionPreferences(application, exercise));
    }

    function getJurisdictionPreferences(application, exercise) {
      const data = [];
      if (typeof (application.jurisdictionPreferences) === 'string') {
        addField(data, exercise.jurisdictionQuestion, application.jurisdictionPreferences);
      } else {
        addField(data, exercise.jurisdictionQuestion, application.jurisdictionPreferences.join('\n'));
      }
      return data;
    }

    if (exercise.memberships && exercise.memberships.indexOf('none') === -1) {
      console.log(exercise.memberships);
      html.addHeading('Memberships');

      if (showMembershipOption(application, 'chartered-association-of-building-engineers')) {
        html.addTable(getMembershipData(application, 'chartered-association-of-building-engineers', 0));
      }

      if (showMembershipOption(application, 'chartered-institute-of-building')) {
        html.addTable(getMembershipData(application, 'chartered-institute-of-building', 1));
      }

      if (showMembershipOption(application, 'chartered-institute-of-environmental-health')) {
        html.addTable(getMembershipData(application, 'chartered-institute-of-environmental-health', 2));
      }

      if (showMembershipOption(application, 'general-medical-council')) {
        html.addTable(getMembershipData(application, 'general-medical-council', 3));
      }

      if (showMembershipOption(application, 'royal-college-of-psychiatrists')) {
        html.addTable(getMembershipData(application, 'royal-college-of-psychiatrists', 4));
      }

      if (showMembershipOption(application, 'royal-institution-of-chartered-surveyors')) {
        html.addTable(getMembershipData(application, 'royal-institution-of-chartered-surveyors', 5));
      }

      if (showMembershipOption(application, 'royal-institute-of-british-architects')) {
        html.addTable(getMembershipData(application, 'royal-institute-of-british-architects', 6));
      }

      if (showMembershipOption(application, 'other')) {
        html.addTable(getMembershipData(application, 'other', 7));
      }
    }

    return html.toString();
  }

  function showMembershipOption(application, ref) {
    if (application && application.professionalMemberships) {
      return application.professionalMemberships.indexOf(ref) >= 0;
    }
    return false;
  }

  function getMembershipData(application, label, optionToShow) {

    let membershipData = [];

    const charteredAssociationBuildingEngineersDate = application.charteredAssociationBuildingEngineersDate;
    const charteredAssociationBuildingEngineersNumber = application.charteredAssociationBuildingEngineersNumber;
    const charteredAssociationBuildingEngineersInformation = application.charteredAssociationBuildingEngineersInformation;

    const charteredInstituteBuildingDate = application.charteredInstituteBuildingDate;
    const charteredInstituteBuildingNumber = application.charteredInstituteBuildingNumber;
    const charteredInstituteBuildingInformation = application.charteredInstituteBuildingInformation;

    const charteredInstituteEnvironmentalHealthDate = application.charteredInstituteEnvironmentalHealthDate;
    const charteredInstituteEnvironmentalHealthNumber = application.charteredInstituteEnvironmentalHealthNumber;
    const charteredInstituteEnvironmentalHealthInformation = application.charteredInstituteEnvironmentalHealthInformation;

    const generalMedicalCouncilDate = application.generalMedicalCouncilDate;
    const generalMedicalCouncilNumber = application.generalMedicalCouncilNumber;
    const generalMedicalCouncilInformation = application.generalMedicalCouncilInformation;

    const generalMedicalCouncilConditional = application.generalMedicalCouncilConditional;
    const generalMedicalCouncilConditionalDetails = application.generalMedicalCouncilConditionalDetails;
    const generalMedicalCouncilConditionalStartDate = application.generalMedicalCouncilConditionalStartDate;
    const generalMedicalCouncilConditionalEndDate = application.generalMedicalCouncilConditionalEndDate;

    const royalCollegeOfPsychiatristsDate = application.royalCollegeOfPsychiatristsDate;
    const royalCollegeOfPsychiatristsNumber = application.royalCollegeOfPsychiatristsNumber;
    const royalCollegeOfPsychiatristsInformation = application.royalCollegeOfPsychiatristsInformation;

    const royalInstitutionCharteredSurveyorsDate = application.royalInstitutionCharteredSurveyorsDate;
    const royalInstitutionCharteredSurveyorsNumber = application.royalInstitutionCharteredSurveyorsNumber;
    const royalInstitutionCharteredSurveyorsInformation = application.royalInstitutionCharteredSurveyorsInformation;

    const royalInstituteBritishArchitectsDate = application.royalInstituteBritishArchitectsDate;
    const royalInstituteBritishArchitectsNumber = application.royalInstituteBritishArchitectsNumber;
    const royalInstituteBritishArchitectsInformation = application.royalInstituteBritishArchitectsInformation;

    const otherProfessionalMemberships = application.otherProfessionalMemberships;
    const otherProfessionalMembershipsDate = application.otherProfessionalMembershipsDate;
    const otherProfessionalMembershipsNumber = application.otherProfessionalMembershipsNumber;
    const otherProfessionalMembershipsInformation = application.otherProfessionalMembershipsInformation;

    const charteredAssociation = [charteredInstituteBuildingDate, charteredInstituteBuildingNumber, charteredInstituteBuildingInformation];
    const charteredAssociationBuildingEngineers = [charteredAssociationBuildingEngineersDate, charteredAssociationBuildingEngineersNumber, charteredAssociationBuildingEngineersInformation];
    const charteredInstituteEnvironmentalHealth = [charteredInstituteEnvironmentalHealthDate, charteredInstituteEnvironmentalHealthNumber, charteredInstituteEnvironmentalHealthInformation];
    const generalMedicalCouncilCond = [generalMedicalCouncilConditional, generalMedicalCouncilConditionalDetails, generalMedicalCouncilConditionalStartDate, generalMedicalCouncilConditionalEndDate];
    const generalMedicalCouncil = [generalMedicalCouncilDate, generalMedicalCouncilNumber, generalMedicalCouncilInformation];
    const royalCollegeOfPsychiatrists = [royalCollegeOfPsychiatristsDate, royalCollegeOfPsychiatristsNumber, royalCollegeOfPsychiatristsInformation];
    const royalInstituteBritishArchitects = [royalInstituteBritishArchitectsDate, royalInstituteBritishArchitectsNumber, royalInstituteBritishArchitectsInformation];
    const royalInstituteOfBritishSurveyors = [royalInstitutionCharteredSurveyorsDate, royalInstitutionCharteredSurveyorsNumber, royalInstitutionCharteredSurveyorsInformation];
    const otherMemberships = [otherProfessionalMemberships, otherProfessionalMembershipsDate, otherProfessionalMembershipsNumber, otherProfessionalMembershipsInformation];

    membershipData = [
      charteredAssociationBuildingEngineers,
      charteredAssociation,
      generalMedicalCouncil,
      generalMedicalCouncilCond,
      charteredInstituteEnvironmentalHealth,
      royalCollegeOfPsychiatrists,
      royalInstituteBritishArchitects,
      royalInstituteOfBritishSurveyors,
      otherMemberships];

    const data = [];

    if (optionToShow !== 8 && optionToShow !== 3) {
      addField(data, lookup(label), `${formatDate(membershipData[optionToShow][0])}</br>${membershipData[optionToShow][1]}</br>${membershipData[optionToShow][2]}`);
    }

    if (optionToShow === 3) { // add conditional dates
      addField(data, lookup(label), `${formatDate(membershipData[optionToShow][0])}</br>${membershipData[optionToShow][0][1]}</br>${membershipData[optionToShow][0][2]}</br>`);
    }

    if (optionToShow === 8) {
      membershipData[8].forEach(item => {
        addField(data, 'Other memberships', `${formatDate(item[0])}</br>${item[1]}</br>${item[2]}`);
      });
    }
    return data;
  }

  function getAssessorsData(application) {
    const firstAssessorFullName = application.firstAssessorFullName;
    const firstAssessorEmail = application.firstAssessorEmail;
    const firstAssessorPhone = application.firstAssessorPhone;
    const firstAssessorTitle = application.firstAssessorTitle;

    const secondAssessorFullName = application.secondAssessorFullName;
    const secondAssessorEmail = application.secondAssessorEmail;
    const secondAssessorPhone = application.secondAssessorPhone;
    const secondAssessorTitle = application.secondAssessorTitle;

    const firstAssessor = [firstAssessorFullName, firstAssessorTitle, firstAssessorEmail, firstAssessorPhone];
    const secondAssessor = [secondAssessorFullName, secondAssessorTitle, secondAssessorEmail, secondAssessorPhone];
    const data = [];
    const assessorData = [firstAssessor, secondAssessor];

    assessorData.forEach((d, idx) => {
      addField(data, 'Full name', d[0], idx !== 0);
      addField(data, 'Title or position', d[1]);
      addField(data, 'Email', d[2]);
      addField(data, 'Phone', d[3]);
    });
    return data;
  }

  function formatLawRelatedTasks(experience) {
    let value = '';
    if (experience.tasks) {
      experience.tasks.forEach(task => {
        value += lookup(task) + '<br/>';
      });
    }
    if (experience.otherTasks) {
      value += experience.otherTasks;
    }
    return value;
  }

  // html.addTitle('Personal details');
  // html.addTable(getPersonalDetails(application));

  function getPersonalDetails(application) {
    const personalDetailsData = application.personalDetails;
    const data = [];
    Object.keys(personalDetailsData).forEach(key => {
      addField(data, key, personalDetailsData[key]);
    });
    return data;
  }

  // html.addTitle('Character information');
  // html.addTable(getCharacterInformation(application));

  function getCharacterInformation(application) {
    const characterData = application.characterInformation;
    const data = [];
    Object.keys(characterData).forEach(key => {
      addField(data, key, characterData[key]);
    });
    return data;
  }

  // html.addTitle('Equality and diversity information');
  // html.addTable(getEqualityAndDiversityInfo(application));

  function getEqualityAndDiversityInfo(application) {
    const EqualityAndDiversityData = application.equalityAndDiversitySurvey;
    const data = [];
    Object.keys(EqualityAndDiversityData).forEach(key => {
      addField(data, key, EqualityAndDiversityData[key]);
    });
    return data;
  }

  // if (application.partTimeWorkingPreferences && application.partTimeWorkingPreferences.length) {
  //   html.addHeading('Part Time Working Preferences');
  //   html.addTable(getPartTimeWorkingPreferences(application, exercise));
  // }

  function getPartTimeWorkingPreferences(application, exercise) {
    const data = [];
    addField(data, exercise.yesSalaryDetails, application.partTimeWorkingPreferencesDetails);
    return data;
  }

  // if (application.locationPreferences && application.locationPreferences.length ) {
  //   html.addHeading('Location preferences');
  //   html.addTable(getLocationPreferences(application, exercise));
  // }

  function getLocationPreferences(application, exercise) {
    const data = [];
    if (exercise.locationQuestionType === 'single-choice') {
      addField(data, exercise.locationQuestion, application.locationPreferences);
    } else {
      addField(data, exercise.locationQuestion, application.locationPreferences.join('\n'));
    }
    return data;
  }
};
