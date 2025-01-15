import htmlWriter from '../htmlWriter.js';
import lookup from './lookup.js';
import { addField, formatDate, toYesNo } from './helpers.js';
import * as helpers from '../../shared/helpers.js';
import { objectHasNestedProperty } from '../helpers.js';

import { getJurisdictionPreferences, getLocationPreferences, getAdditionalWorkingPreferences } from './workingPreferencesConverter.js';
import has from 'lodash/has.js';

export default () => {

  return {
    getHtmlPanelPack,
    getExperienceData,
    getAdditionalSelectionCriteria,
    getWelshData,
  };

  function getHtmlPanelPack(application, exercise, params) {

    let html = new htmlWriter();

    if (application && Object.keys(application).length) {
      if (params && params.showNames && has(application, 'personalDetails.fullName') && has(application, 'referenceNumber')) {
        html.addTitle(`${application.personalDetails.fullName} ${application.referenceNumber}`);
      }
      else if (has(application, 'referenceNumber')) {
        html.addTitle(application.referenceNumber);
      }
      else {
        // The last resort if no other info is available!
        html.addTitle('Error - Missing Application Title');
      }
    }
    else {
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

      if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
        html.addHeading('Post-qualification experience');
        html.addTable(getPostQualificationData(application, exercise));
      }

      if ((exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') && exercise.previousJudicialExperienceApply) {
        if (exercise._applicationVersion < 3) {
          html.addHeading('Judicial experience');
          html.addTable(getJudicialExperience(application, exercise));
        }
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

      const jurisdictionPrefs = getJurisdictionPreferences(application, exercise);
      if (jurisdictionPrefs.length) {
        html.addHeading('Jurisdiction Preferences');
        html.addTable(jurisdictionPrefs);
      }

      const locationPrefs = getLocationPreferences(application, exercise);
      if (locationPrefs.length) {
        html.addHeading('Location Preferences');
        html.addTable(locationPrefs);
      }
      
      const additionalPrefs = getAdditionalWorkingPreferences(application, exercise);
      if (additionalPrefs.length) {
        html.addHeading('Additional Preferences');
        html.addTable(additionalPrefs);
      }
      
      if (objectHasNestedProperty(application, 'uploadedSelfAssessment') && application.uploadedSelfAssessment) {
        const selfAssessment = getSelfAssessment(application, exercise);
        if (selfAssessment.length) {
          html.addHeading('Self Assessment');
          html.addTable(selfAssessment);
        }
      }

      if (objectHasNestedProperty(application, 'selectionCriteriaAnswers') && application.selectionCriteriaAnswers && application.selectionCriteriaAnswers.length) {
        html.addHeading('Additional selection criteria');
        html.addTable(getAdditionalSelectionCriteria(application, exercise));
      }

    } else {
      html.addTitle('Error - Missing Exercise information');
    }

    return html.toString();
  }

  function getSelfAssessment(application, exercise) {
    const selfAssessmentData = application.uploadedSelfAssessmentContent;
    const data = [];
    if (!selfAssessmentData || !exercise.selfAssessmentWordLimits) return data;
    selfAssessmentData.forEach((q, i) => {
      // The last argument below tells addField that the heading and data should go in separate rows
      addField(data, exercise.selfAssessmentWordLimits[i].question, q, false, true);
    });
    return data;
  }

  function getQualificationData(exercise, application) {
    const qualificationData = application.qualifications;
    const data = [];

    if (!qualificationData) return data;

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
      if (!q.completedPupillage && q.details) {
        addField(data, 'Completed pupillage', 'No');
        addField(data, 'Did not complete pupillage notes', q.details);
      }
    });

    if (exercise.schedule2Apply) {
      if (exercise.appliedSchedule === 'schedule-2-3') {
        addField(data, 'Are you applying under Schedule 3(d)?', toYesNo(application.applyingForSchedule2Three));
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

  function getPostQualificationData(application, exercise) {
    const experienceData = application.experience;
    const data = [];
    if (experienceData && experienceData.length) {
      experienceData.forEach((e, idx) => {
        const dates = [];
        if (e.startDate) dates.push(helpers.formatDate(e.startDate, 'MMM YYYY'));
        if (e.isOngoing || !Object.prototype.hasOwnProperty.call(e, 'endDate')) dates.push('Ongoing');   // Support new/old applications
        else if (e.endDate) dates.push(helpers.formatDate(e.endDate, 'MMM YYYY'));

        addField(data, 'Job title', e.jobTitle, idx !== 0);
        addField(data, 'Organisation or business', e.orgBusinessName);
        addField(data, 'Dates worked', dates.join(' - '));
        addField(data, 'Law related tasks', formatLawRelatedTasks(e));

        // check if application version is 3 or above
        if (Array.isArray(e.tasks) && e.tasks.includes('judicial-functions') && exercise._applicationVersion >= 3 && e.judicialFunctions) {
          const { type, duration, isLegalQualificationRequired, details } = e.judicialFunctions;
          addField(data, 'Is this a judicial or quasi-judicial post?', type ? lookup(type) : '');
          addField(data, 'How many sitting days have you accumulated in this post?', duration || '');
          addField(data, 'Is a legal qualification a requisite for appointment?', toYesNo(isLegalQualificationRequired) || '');

          if (type === 'quasi-judicial-post') {
            addField(data, 'Powers, procedures and main responsibilities', details || '');
          }
        }
      });
    }

    // check if application version is 3 or above
    if (exercise._applicationVersion >= 3) {
      addField(data, 'Details of how you have acquired the necessary skills', application.experienceDetails);
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
    if (experienceData && Array.isArray(experienceData)) {
      experienceData.forEach(eD => {
        addField(data, 'Organisation or business', eD.orgBusinessName);
        addField(data, 'Job title', eD.jobTitle);
        addField(data, 'Date qualified', `${formatDate(eD.startDate)} - ${formatDate(eD.endDate) || 'current'}`);
      });
    }
    return data;
  }

  function getAdditionalSelectionCriteria(application, exercise) {
    if (!exercise.selectionCriteria) return [];
    if (!application.selectionCriteriaAnswers) return [];
    const additionalSelectionCriteria = application.selectionCriteriaAnswers;
    const data = [];
    additionalSelectionCriteria.forEach((sC, index) => {
      const answer = sC.answerDetails || 'Does not meet this requirement';
      // The last argument below tells addField that the heading and data should go in separate rows
      addField(data, exercise.selectionCriteria[index].title, answer, false, true);
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
    addField(data, 'Applying for Welsh posts?', toYesNo(application.applyingForWelshPost));
    if ('applyingForWelshPost' in application) {
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
