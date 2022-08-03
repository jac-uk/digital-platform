const { getBaseTransformPreset } = require('@vue/compiler-core');
const { getDocument, getDocuments } = require('../../shared/helpers');

module.exports = (firebase, db) => {
  return {
    generateDiversityData,
  };

  async function generateDiversityData(exerciseId) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    if (!exercise) { return false; }

    // get submitted applications (inc withdrawn)
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', 'in', ['applied', 'withdrawn'])
    );

    const data = {};

    applications.forEach(application => {
      const map = {
        disability: getDisability(application),
        ethnicity: getEthnicity(application),
        gender: getGender(application),
        professionalBackground: getProfessionalBackground(application),
        socialMobility: getSocialMobility(application),
      };
      data[application.id] = map;
    });

    await db.collection('exercises').doc(exerciseId).collection('data').doc('diversity').set(data);
    return data;
  }
};

const VALUES = {
  OTHER: 'other',
  NO_ANSWER: '',
  PREFER_NOT_TO_SAY: 'preferNotToSay',
  YES: 'yes',
  NO: 'no',
  WHITE: 'white',
  BAME: 'bame',
  MALE: 'male',
  FEMALE: 'female',
  GENDER_NEUTRAL: 'genderNeutral',
  BARRISTER: 'barrister',
  CILEX: 'cilex',
  SOLICITOR: 'solicitor',
  ATTENDED_UK_STATE_SCHOOL: 'attendedUKStateSchool',
  FIRST_GENERATION_UNIVERSITY: 'firstGenerationUniversity',
};

const getDisability = (application) => {
  if (application.disability === true) {
    return VALUES.YES;
  } else if (application.disability === false) {
    return VALUES.NO;
  } else if (application.disability === 'prefer-not-to-say') {
    return VALUES.PREFER_NOT_TO_SAY;
  } else {
    return VALUES.NO_ANSWER;
  }
};

const getEthnicity = (application) => {
  const survey = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  if (survey.ethnicGroup) {
    switch (survey.ethnicGroup) {
      case 'uk-ethnic':
      case 'irish':
      case 'gypsy-irish-traveller':
      case 'other-white':
        return VALUES.WHITE;
      case 'prefer-not-to-say':
        return VALUES.PREFER_NOT_TO_SAY;
      case 'other-ethnic-group':
        return VALUES.OTHER;
      default: // @todo check catch all is appropriate for bame
        return VALUES.BAME;
    }
  } else {
    return VALUES.NO_ANSWER;
  }
};

const getGender = (application) => {
  const survey = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  if (survey.gender) {
    switch (survey.gender) {
      case 'male':
        return VALUES.MALE;
      case 'female':
        return VALUES.FEMALE;
      case 'prefer-not-to-say':
        return VALUES.PREFER_NOT_TO_SAY;
      case 'gender-neutral':
        return VALUES.GENDER_NEUTRAL;
      case 'other-gender':
        return VALUES.OTHER;
      default:
        return VALUES.NO_ANSWER;
    }
  } else {
    return VALUES.NO_ANSWER;
  }
};

const getProfessionalBackground = (application) => {
  const survey = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  const values = [];
  if (survey.professionalBackground && survey.professionalBackground.length) {
    if (survey.professionalBackground.indexOf('barrister') >= 0) {
      values.push(VALUES.BARRISTER);
    }
    if (survey.professionalBackground.indexOf('cilex') >= 0) {
      values.push(VALUES.CILEX);
    }
    if (survey.professionalBackground.indexOf('solicitor') >= 0) {
      values.push(VALUES.SOLICITOR);
    }
    if (survey.professionalBackground.indexOf('other-professional-background') >= 0) {
      values.push(VALUES.OTHER);
    }
    if (survey.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
      values.push(VALUES.PREFER_NOT_TO_SAY);
    }
  } else {
    values.push(VALUES.NO_ANSWER);
  }
  return values;
};

const getSocialMobility = (application) => {
  const survey = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  const values = [];
  if (
    survey.stateOrFeeSchool === 'uk-state-selective'
    || survey.stateOrFeeSchool === 'uk-state-non-selective'
  ) {
    values.push(VALUES.ATTENDED_UK_STATE_SCHOOL);
  }
  if (survey.firstGenerationStudent === true) {
    values.push(VALUES.FIRST_GENERATION_UNIVERSITY);
  }
  return values;
};
