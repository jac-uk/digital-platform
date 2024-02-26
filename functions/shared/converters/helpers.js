const lookup = require('./lookup');

const firebase = require('firebase-admin');
const Timestamp = firebase.firestore.Timestamp;

const addField = (array, label, value, lineBreak = false) => {
  if (value === undefined || value === null || value === '') {
    return;
  }
  if (typeof (value) === 'boolean') {
    value = toYesNo(value);
  }
  array.push({ value: value, label: label, lineBreak: lineBreak });
};

const toYesNo = (value) => {
  // Only convert booleans, not all falsy values mean "no"
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return value;
};


const toDateString = (date) => {
  const dateParts = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0]
    .split('-');
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

const formatDate = (value) => {
  if (value && (value.seconds !== undefined || value._seconds !== undefined)) { // convert firestore timestamp to date
    const seconds = value.seconds || value._seconds;
    const nanoseconds = value.nanoseconds || value._nanoseconds;
    value = new Timestamp(seconds, nanoseconds);
    value = value.toDate();
  }
  if (!isNaN(new Date(value).valueOf()) && value !== null) {
    if (!(value instanceof Date)) {
      value = new Date(value);
    }
    value = toDateString(value);
  }
  return value ? value : '';
};

const formatNIN = (value) => {
  return value ? value.toUpperCase() : '';
};

const heldFeePaidJudicialRole = (value) => {
  if (typeof value === 'string' && ['fee-paid-court-post', 'fee-paid-tribunal-post', 'other-fee-paid-judicial-office'].includes(value)) {
    value = 'Yes';
    return value;
  }

  if (typeof value === 'boolean' && value === false) {
    value = 'No';
    return value;
  }

  if (value === undefined || value === null || (typeof value === 'string' && value.length === 0)) {
    value = 'Unknown';
    return value;
  }

  value = 'Prefer not to say';
  return value;
};

const flattenCurrentLegalRole = (equalityAndDiversitySurvey) => {
  if (!(equalityAndDiversitySurvey && equalityAndDiversitySurvey.currentLegalRole)) {
    return '';
  }

  const roles = [];
  equalityAndDiversitySurvey.currentLegalRole.forEach((role) => {
    if (role === 'other-fee-paid-judicial-office-holder') {
      roles.push(`other: ${ equalityAndDiversitySurvey.otherCurrentFeePaidJudicialOfficeHolderDetails }`);
    } else if (role === 'other-salaried-judicial-office-holder') {
      roles.push(`other: ${ equalityAndDiversitySurvey.otherCurrentSalariedJudicialOfficeHolderDetails}`);
    } else if (role === 'other-current-legal-role') {
      roles.push(`Other: ${ equalityAndDiversitySurvey.otherCurrentLegalRoleDetails }`);
    } else {
      roles.push(lookup(role));
    }
  });

  return roles.join('\n');
};

const flattenProfessionalBackground = (equalityAndDiversitySurvey) => {
  if (!(equalityAndDiversitySurvey && equalityAndDiversitySurvey.professionalBackground)) {
    return '';
  }
  const roles = [];
  equalityAndDiversitySurvey.professionalBackground.forEach((role) => {
    if (role === 'other-professional-background') {
      roles.push(`Other: ${ equalityAndDiversitySurvey.otherProfessionalBackgroundDetails }`);
    } else {
      roles.push(lookup(role));
    }
  });
  return roles.join('\n');
};

const attendedUKStateSchool = (equalityAndDiversitySurvey, exercise) => {
  // Add checks for different fields after 01-04-2023
  if (applicationOpenDatePost01042023(exercise)) {
    if (!(equalityAndDiversitySurvey && equalityAndDiversitySurvey.stateOrFeeSchool16)) {
      return '';
    }
    return toYesNo(['uk-state-selective', 'uk-state-non-selective'].indexOf(equalityAndDiversitySurvey.stateOrFeeSchool16) >= 0);
  }
  else {
    if (!(equalityAndDiversitySurvey && equalityAndDiversitySurvey.stateOrFeeSchool)) {
      return '';
    }
    return toYesNo(['uk-state-selective', 'uk-state-non-selective'].indexOf(equalityAndDiversitySurvey.stateOrFeeSchool) >= 0);
  }
};

const applicationOpenDatePost01042023 = (exercise) => {
  const usesPre01042023Questions = ['JAC00130', 'JAC00123', 'JAC00164'].includes(exercise.referenceNumber);
  if (usesPre01042023Questions) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(exercise, 'applicationOpenDate') && exercise.applicationOpenDate.toDate() > new Date('2023-04-01');
};

/**
 * Returns the number with its corresponding ordinal suffix.
 *
 * @param {number} n - The number for which the ordinal suffix needs to be determined.
 * @returns {string} - The input number with its corresponding ordinal suffix.
 *
 * @example
 * const result = ordinal(1);
 * console.log(result); // Output: 1st
 */
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getJudicialExperienceString = (exercise, application) => {
  let judicialExperience = '';
  if (exercise._applicationVersion >= 3) {
    let judicialExperiences = [];
    let quasiJudicialExperiences = [];
    Array.isArray(application.experience) && application.experience.forEach(experience => {
      if (experience.jobTitle && experience.judicialFunctions) {
        if (experience.judicialFunctions.type === 'judicial-post') {
          judicialExperiences.push(experience.jobTitle);
        } else if (experience.judicialFunctions.type === 'quasi-judicial-post') {
          quasiJudicialExperiences.push(experience.jobTitle);
        }
      }
    });

    if (judicialExperiences.length) {
      judicialExperience += `Judicial - ${judicialExperiences.join(', ')}\n`;
    }
    if (quasiJudicialExperiences.length) {
      judicialExperience += `Quasi-judicial - ${quasiJudicialExperiences.join(', ')}`;
    }

    if (!judicialExperience) {
      judicialExperience = `Acquired skills in other way - ${lookup(application.experienceDetails)}`;
    }
  } else {
    if (application.feePaidOrSalariedJudge) {
      judicialExperience = `Fee paid or salaried judge - ${lookup(application.feePaidOrSalariedSittingDaysDetails)} days`;
    } else if (application.declaredAppointmentInQuasiJudicialBody) {
      judicialExperience = `Quasi-judicial body - ${lookup(application.quasiJudicialSittingDaysDetails)} days`;
    } else {
      judicialExperience = `Acquired skills in other way - ${lookup(application.skillsAquisitionDetails)}`;
    }
  }

  return judicialExperience;
};

module.exports = {
  addField,
  toYesNo,
  formatDate,
  toDateString,
  formatNIN,
  heldFeePaidJudicialRole,
  flattenCurrentLegalRole,
  flattenProfessionalBackground,
  attendedUKStateSchool,
  applicationOpenDatePost01042023,
  ordinal,
  getJudicialExperienceString,
};
