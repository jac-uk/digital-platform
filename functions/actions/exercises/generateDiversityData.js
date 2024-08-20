import { getDocument, getDocuments } from '../../shared/helpers.js';
import { applicationOpenDatePost01042023 } from '../../shared/converters/helpers.js';
// import sizeof from 'firestore-size';

export default (firebase, db) => {
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

    const data = {
      applicationsMap: {},
    };

    applications.forEach(application => {
      const ref = application.referenceNumber.split('-')[1];
      data.applicationsMap[ref] = {
        d: getDiversityFlags(application, exercise),
      };
    });

    // const bytes = sizeof(data);
    // console.log('doc bytes', bytes);

    await db.collection('exercises').doc(exerciseId).collection('data').doc('diversity').set(data);
    return data;
  }
};

const DIVERSITY_CHARACTERISTICS = {
  DISABILITY_DISABLED: 'd',
  DISABILITY_NOT_SAY: 'dx',
  ETHNICITY_WHITE: 'w',
  ETHNICITY_BAME: 'b',
  ETHNICITY_OTHER: 'eo',
  ETHNICITY_NOT_SAY: 'ex',
  GENDER_MALE: 'm',
  GENDER_FEMALE: 'f',
  GENDER_NEUTRAL: 'gn',
  GENDER_OTHER: 'go',
  GENDER_NOT_SAY: 'gx',
  PARENTS_ATTENDED_UNIVERSITY: 'pau',
  PROFESSION_BARRISTER: 'pb',
  PROFESSION_CILEX: 'pc',
  PROFESSION_SOLICITOR: 'ps',
  PROFESSION_OTHER: 'po',
  PROFESSION_NOT_SAY: 'px',
  UK_STATE_SCHOOL: 'ss',
  UK_STATE_SCHOOL_16: 'ss16',
  FIRST_GENERATION_UNIVERSITY: 'u1',
};

const getDiversityFlags = (application, exercise) => {
  const flags = [];
  const survey = application.equalityAndDiversitySurvey ? application.equalityAndDiversitySurvey : application;
  if (survey.disability === true) {
    flags.push(DIVERSITY_CHARACTERISTICS.DISABILITY_DISABLED);
  } else if (survey.disability === false) {
    // nothing
  } else if (survey.disability === 'prefer-not-to-say') {
    flags.push(DIVERSITY_CHARACTERISTICS.DISABILITY_NOT_SAY);
  }
  if (survey.ethnicGroup) {
    switch (survey.ethnicGroup) {
      case 'uk-ethnic':
      case 'irish':
      case 'gypsy-irish-traveller':
      case 'other-white':
        flags.push(DIVERSITY_CHARACTERISTICS.ETHNICITY_WHITE);
        break;
      case 'prefer-not-to-say':
        flags.push(DIVERSITY_CHARACTERISTICS.ETHNICITY_NOT_SAY);
        break;
      case 'other-ethnic-group':
        flags.push(DIVERSITY_CHARACTERISTICS.ETHNICITY_OTHER);
        break;
      default: // @todo check catch all is appropriate for bame
        flags.push(DIVERSITY_CHARACTERISTICS.ETHNICITY_BAME);
    }
  }
  if (survey.gender) {
    switch (survey.gender) {
      case 'male':
        flags.push(DIVERSITY_CHARACTERISTICS.GENDER_MALE);
        break;
      case 'female':
        flags.push(DIVERSITY_CHARACTERISTICS.GENDER_FEMALE);
        break;
      case 'prefer-not-to-say':
        flags.push(DIVERSITY_CHARACTERISTICS.GENDER_NOT_SAY);
        break;
      case 'gender-neutral':
        flags.push(DIVERSITY_CHARACTERISTICS.GENDER_NEUTRAL);
        break;
      case 'other-gender':
        flags.push(DIVERSITY_CHARACTERISTICS.GENDER_OTHER);
        break;
      default:
    }
  }
  if (survey.professionalBackground && survey.professionalBackground.length) {
    if (survey.professionalBackground.indexOf('barrister') >= 0) {
      flags.push(DIVERSITY_CHARACTERISTICS.PROFESSION_BARRISTER);
    }
    if (survey.professionalBackground.indexOf('cilex') >= 0) {
      flags.push(DIVERSITY_CHARACTERISTICS.PROFESSION_CILEX);
    }
    if (survey.professionalBackground.indexOf('solicitor') >= 0) {
      flags.push(DIVERSITY_CHARACTERISTICS.PROFESSION_SOLICITOR);
    }
    if (survey.professionalBackground.indexOf('other-professional-background') >= 0) {
      flags.push(DIVERSITY_CHARACTERISTICS.PROFESSION_OTHER);
    }
    if (survey.professionalBackground.indexOf('prefer-not-to-say') >= 0) {
      flags.push(DIVERSITY_CHARACTERISTICS.PROFESSION_NOT_SAY);
    }
  }

  // Add checks for different fields after 01-04-2023
  if (applicationOpenDatePost01042023(exercise)) {
    if (
      survey.stateOrFeeSchool16 === 'uk-state-selective'
      || survey.stateOrFeeSchool16 === 'uk-state-non-selective'
    ) {
      flags.push(DIVERSITY_CHARACTERISTICS.UK_STATE_SCHOOL_16);
    }
    if (survey.parentsAttendedUniversity === true) {
      flags.push(DIVERSITY_CHARACTERISTICS.PARENTS_ATTENDED_UNIVERSITY);
    }
  }
  else {
    if (
      survey.stateOrFeeSchool === 'uk-state-selective'
      || survey.stateOrFeeSchool === 'uk-state-non-selective'
    ) {
      flags.push(DIVERSITY_CHARACTERISTICS.UK_STATE_SCHOOL);
    }
    if (survey.firstGenerationStudent === true) {
      flags.push(DIVERSITY_CHARACTERISTICS.FIRST_GENERATION_UNIVERSITY);
    }
  }

  return flags;
};
