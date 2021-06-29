// TODO sort out firestore date formatting

const htmlWriter = require('../htmlWriter');
const lookup = require('./lookup');
const {addField, formatDate, toDateString, toYesNo} = require('./helpers');

module.exports = () => {

  return {
    getHtmlPanelPack,
    getAdditionalSelectionCriteria,
    // TODO include other converters
  };

  function getHtmlPanelPack(application, exercise, params) {

    let html = new htmlWriter();

    if (application && Object.keys(application).length) {
      // console.log(application);
      if (params && params.showNames) {
        html.addTitle(`${application.personalDetails.fullName} ${application.referenceNumber}`);
      } else {
        html.addTitle(application.referenceNumber);
      }

      if (application.jurisdictionPreferences && application.jurisdictionPreferences.length) {
        html.addHeading('Jurisdiction Preferences');
        html.addTable(getJurisdictionPreferences(application, exercise));
      }

      if (application.additionalWorkingPreferences && application.additionalWorkingPreferences.length) {
        html.addHeading('Additional Preferences');
        html.addTable(getAdditionalWorkingPreferences(application, exercise));
      }

      if (application.selectionCriteriaAnswers && application.selectionCriteriaAnswers.length) {
        html.addHeading('Additional selection criteria');
        html.addTable(getAdditionalSelectionCriteria(application, exercise));
      }
    } else {
      html.addTitle('Error - Missing Application information');
    }

    if (exercise && Object.keys(exercise).length) {
      if (exercise.welshRequirement) {
        html.addHeading('Welsh posts');
        html.addTable(getWelshData(application));
      }

      if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
        html.addHeading('Qualifications');
        html.addTable(getQualificationData(exercise, application));
      }

      if (exercise.typeOfExercise === 'legal') {
        html.addHeading('Post-qualification experience');
        html.addTable(getPostQualificationData(application));
      }

      if ((exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') && exercise.previousJudicialExperienceApply) {
        html.addHeading('Judicial experience');
        html.addTable(getJudicialExperience(application, exercise));
      }

      if (exercise.typeOfExercise === 'non-legal' || exercise.typeOfExercise === 'leadership-non-legal') {
        html.addHeading('Experience');
        html.addTable(getExperienceData(application));
      }

      if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
        html.addHeading('Employment gaps');
        const data = getEmploymentGaps(application);
        if (data.length > 0) {
          html.addTable(data);
        } else {
          html.addParagraph('No gaps in employment declared');
        }
      }

      if (exercise.memberships && exercise.memberships.indexOf('none') === -1) {
        const data = getMembershipData(application);
        if (data.length) {
          html.addHeading('Memberships');
          html.addTable(data);
        }
      }
    } else {
      html.addTitle('Error - Missing Exercise information');
    }

    return html.toString();
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

  function getAdditionalWorkingPreferences(application, exercise) {
    const additionalWorkingPreferenceData = application.additionalWorkingPreferences;
    const data = [];
    additionalWorkingPreferenceData.forEach((item, index) => {
      addField(data, lookup(exercise.additionalWorkingPreferences[index].questionType));
      if (exercise.additionalWorkingPreferences[index].questionType === 'single-choice') {
        addField(data, exercise.additionalWorkingPreferences[index].question, item.selection);
      }
      if (exercise.additionalWorkingPreferences[index].questionType === 'multiple-choice') {
        const multipleChoice = [];
        item.selection.forEach((choice) => {
          multipleChoice.push(`<br/>${choice}`);
        });
        addField(data, exercise.additionalWorkingPreferences[index].question, `answer: ${multipleChoice}`);
      }
      if (exercise.additionalWorkingPreferences[index].questionType === 'ranked-choice') {
        const rankedAnswer = [];
        item.selection.forEach((choice, index) => {
          rankedAnswer.push(`<br/>${index + 1}: ${choice}`);
        });
        addField(data, exercise.additionalWorkingPreferences[index].question, `answer: ${rankedAnswer}`);
      }
    });
    return data;
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
    }
    return data;
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

  function getJudicialExperience(application, exercise) {
    const data = [];
    addField(data, 'Fee-paid or salaried judge', lookup(toYesNo(application.feePaidOrSalariedJudge)));
    if (application.feePaidOrSalariedJudge === true) {
      addField(data, `Sat for at least ${exercise.pjeDays || 30} days`, toYesNo(application.feePaidOrSalariedSatForThirtyDays));
      if (application.feePaidOrSalariedSittingDaysDetails) {
        addField(data, 'Details', application.feePaidOrSalariedSittingDaysDetails);
      }
    }
    if (application.feePaidOrSalariedSatForThirtyDays === false || application.feePaidOrSalariedJudge === false) {
      addField(data, 'Declared an appointment or appointments in a quasi-judicial body in this application', toYesNo(application.declaredAppointmentInQuasiJudicialBody));
      if (application.declaredAppointmentInQuasiJudicialBody === true) {
        addField(data, `Sat for at least ${exercise.pjeDays || 30} days in one or all of these appointments`, toYesNo(application.quasiJudicialSatForThirtyDays));
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

  function getAdditionalSelectionCriteria(application, exercise) {
    const additionalSelectionCriteria = application.selectionCriteriaAnswers;
    const data = [];
    additionalSelectionCriteria.forEach((sC, index) => {
      addField(data, exercise.selectionCriteria[index].title, sC.answerDetails || 'Does not meet this requirement');
    });
    return data;
  }

    function getEmploymentGaps(application) {
      const employmentGapsData = application.employmentGaps;
      const data = [];
      if (employmentGapsData && employmentGapsData.length) {
        employmentGapsData.forEach((eG, idx) => {
          if ((eG.startDate)) {
            addField(data, 'Date of gap', `${formatDate(eG.startDate)} - ${formatDate(eG.endDate) || 'current'}`);
            addField(data, 'Details', eG.details);
            addField(data, 'Law related tasks', formatLawRelatedTasks(eG));
          }
        });
      }
      return data;
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

  function getMembershipData(application) {

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

    const royalCollegeOfPsychiatristsDate = application.royalCollegeOfPsychiatristsDate;
    const royalCollegeOfPsychiatristsNumber = application.royalCollegeOfPsychiatristsNumber;
    const royalCollegeOfPsychiatristsInformation = application.royalCollegeOfPsychiatristsInformation;

    const royalInstitutionCharteredSurveyorsDate = application.royalInstitutionCharteredSurveyorsDate;
    const royalInstitutionCharteredSurveyorsNumber = application.royalInstitutionCharteredSurveyorsNumber;
    const royalInstitutionCharteredSurveyorsInformation = application.royalInstitutionCharteredSurveyorsInformation;

    const royalInstituteBritishArchitectsDate = application.royalInstituteBritishArchitectsDate;
    const royalInstituteBritishArchitectsNumber = application.royalInstituteBritishArchitectsNumber;
    const royalInstituteBritishArchitectsInformation = application.royalInstituteBritishArchitectsInformation;

    const charteredAssociationBuildingEngineers = [charteredAssociationBuildingEngineersDate, charteredAssociationBuildingEngineersNumber, charteredAssociationBuildingEngineersInformation];
    const charteredAssociation = [charteredInstituteBuildingDate, charteredInstituteBuildingNumber, charteredInstituteBuildingInformation];
    const charteredInstituteEnvironmentalHealth = [charteredInstituteEnvironmentalHealthDate, charteredInstituteEnvironmentalHealthNumber, charteredInstituteEnvironmentalHealthInformation];
    const generalMedicalCouncil = getGeneralMedicalCouncilConditions(application);
    const royalCollegeOfPsychiatrists = [royalCollegeOfPsychiatristsDate, royalCollegeOfPsychiatristsNumber, royalCollegeOfPsychiatristsInformation];
    const royalInstituteOfCharteredSurveyors = [royalInstitutionCharteredSurveyorsDate, royalInstitutionCharteredSurveyorsNumber, royalInstitutionCharteredSurveyorsInformation];
    const royalInstituteBritishArchitects = [royalInstituteBritishArchitectsDate, royalInstituteBritishArchitectsNumber, royalInstituteBritishArchitectsInformation];
    const otherMemberships = getOtherMemberships(application);

    membershipData = [
      {label: lookup('chartered-association-of-building-engineers'), data: charteredAssociationBuildingEngineers},
      {label: lookup('chartered-institute-of-building'), data: charteredAssociation},
      {label: lookup('chartered-institute-of-environmental-health'), data: charteredInstituteEnvironmentalHealth},
      {label: lookup('general-medical-council'), data: generalMedicalCouncil},
      {label: lookup('royal-college-of-psychiatrists'), data: royalCollegeOfPsychiatrists},
      {label: lookup('royal-institution-of-chartered-surveyors'), data: royalInstituteOfCharteredSurveyors},
      {label: lookup('royal-institute-of-british-architects'), data: royalInstituteBritishArchitects},
      {label: lookup('other'), data: otherMemberships}];

    const data = [];

    membershipData.forEach(item => {
      addField(data, item.label, formatArray(item.data));
    });

    return data;
  }

  function getOtherMemberships(application) {
    const otherProfessionalMemberships = application.otherProfessionalMemberships;
    const otherProfessionalMembershipsDate = application.otherProfessionalMembershipsDate;
    const otherProfessionalMembershipsNumber = application.otherProfessionalMembershipsNumber;
    const otherProfessionalMembershipsInformation = application.otherProfessionalMembershipsInformation;

    const data = [otherProfessionalMemberships, otherProfessionalMembershipsDate, otherProfessionalMembershipsNumber, otherProfessionalMembershipsInformation];

    if (application.memberships) {
      if (otherProfessionalMemberships) {
        data.push('<br/>');
      }
      Object.keys(application.memberships).forEach(key => {
        const membership = application.memberships[key];
        data.push(`${lookup(key)}</br>${formatDate(membership.date)}<br/>${membership.number}<br/>${membership.information}`);
      });
    }
    return data;
  }

  function getGeneralMedicalCouncilConditions(application) {
    const generalMedicalCouncilDate = application.generalMedicalCouncilDate;
    const generalMedicalCouncilNumber = application.generalMedicalCouncilNumber;
    const generalMedicalCouncilInformation = application.generalMedicalCouncilInformation;

    const generalMedicalCouncilConditional = application.generalMedicalCouncilConditional;
    const generalMedicalCouncilConditionalDetails = application.generalMedicalCouncilConditionalDetails;
    const generalMedicalCouncilConditionalStartDate = application.generalMedicalCouncilConditionalStartDate;
    const generalMedicalCouncilConditionalEndDate = application.generalMedicalCouncilConditionalEndDate;

    const data = [generalMedicalCouncilDate, generalMedicalCouncilNumber, generalMedicalCouncilInformation];

    if (generalMedicalCouncilConditional) {
      data.push('<br/>Conditions<br/>');
      if (generalMedicalCouncilConditionalStartDate) {
        data.push(`${formatDate(generalMedicalCouncilConditionalStartDate)} to ${formatDate(generalMedicalCouncilConditionalEndDate) || 'current'}<br>${generalMedicalCouncilConditionalDetails}`);
      }
    }
    return data;
  }

  function formatArray(arr) {
    let result = '';
    arr.forEach(item => {
      if (item === undefined || item === null) {
        return;
      }
      if (typeof (item) === 'object') {
        result += formatDate(item);
      } else {
        result += item;
      }
      result += '<br/>';
    });
    return result;
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

// NOT REQUIRED INFORMATION

  // function showMembershipOption(application, ref) {
  //   if (application && application.professionalMemberships) {
  //     return application.professionalMemberships.indexOf(ref) >= 0;
  //   }
  //   return false;
  // }

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
};
