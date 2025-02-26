'use strict';

import _ from 'lodash';
import { app, db } from './shared/admin.js';
import { ASSESSMENT_METHOD } from '../functions/shared/constants.js';
import { applyUpdates, getDocuments, getDocument } from '../functions/shared/helpers.js';

// whether to make changes in `exercises` collection in firestore
// true:  make changes in `exercises` collection
// false: create a temporary collection `exercises_temp` and verify the changes is as expected
const isAction = false;

const main = async () => {
  const exercises = await getDocuments(db.collection('exercises'));

  const commands = [];
  const exerciseIds = [];
  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const assessmentMethods = {
      [ASSESSMENT_METHOD.SELF_ASSESSMENT_WITH_COMPETENCIES]: false,
      [ASSESSMENT_METHOD.COVERING_LETTER]: false,
      [ASSESSMENT_METHOD.CV]: false,
      [ASSESSMENT_METHOD.STATEMENT_OF_SUITABILITY_WITH_COMPETENCIES]: false,
      [ASSESSMENT_METHOD.STATEMENT_OF_SUITABILITY_WITH_SKILLS_AND_ABILITIES]: false,
      [ASSESSMENT_METHOD.STATEMENT_OF_ELIGIBILITY]: false,
    };

    if (!exercise.assessmentOptions) continue;

    switch (exercise.assessmentOptions) {
      case 'self-assessment-with-competencies':
        assessmentMethods.selfAssessmentWithCompetencies = true;
        break;
      case 'self-assessment-with-competencies-and-covering-letter':
        assessmentMethods.selfAssessmentWithCompetencies = true;
        assessmentMethods.coveringLetter = true;
        break;
      case 'self-assessment-with-competencies-and-cv':
        assessmentMethods.selfAssessmentWithCompetencies = true;
        assessmentMethods.cv = true;
        break;
      case 'self-assessment-with-competencies-and-cv-and-covering-letter':
        assessmentMethods.selfAssessmentWithCompetencies = true;
        assessmentMethods.cv = true;
        assessmentMethods.coveringLetter = true;
        break;
      case 'statement-of-suitability-with-competencies':
        assessmentMethods.statementOfSuitabilityWithCompetencies = true;
        break;
      case 'statement-of-suitability-with-skills-and-abilities':
        assessmentMethods.statementOfSuitabilityWithSkillsAndAbilities = true;
        break;
      case 'statement-of-suitability-with-skills-and-abilities-and-covering-letter':
        assessmentMethods.statementOfSuitabilityWithSkillsAndAbilities = true;
        assessmentMethods.coveringLetter = true;
        break;
      case 'statement-of-suitability-with-skills-and-abilities-and-cv':
        assessmentMethods.statementOfSuitabilityWithSkillsAndAbilities = true;
        assessmentMethods.cv = true;
        break;
      case 'statement-of-suitability-with-skills-and-abilities-and-cv-and-covering-letter':
        assessmentMethods.statementOfSuitabilityWithSkillsAndAbilities = true;
        assessmentMethods.cv = true;
        assessmentMethods.coveringLetter = true;
        break;
      case 'statement-of-eligibility':
        assessmentMethods.statementOfEligibility = true;
        break;
      case 'none':
        break;
      default:
    }

    if (Object.keys(assessmentMethods).length) {
      if (isAction) {
        commands.push({
          command: 'update',
          ref: exercise.ref,
          data: {
            assessmentMethods: {
              ...exercise.assessmentMethods,
              ...assessmentMethods,
            },
          },
        });
      } else {
        const data = _.cloneDeep(exercise);
        data.assessmentMethods = {
          ...exercise.assessmentMethods,
          ...assessmentMethods,
        };
        // delete these properties added by getDocuments
        delete data.id;
        delete data.ref;
        commands.push({
          command: 'set',
          ref: db.collection('exercises_temp').doc(`${exercise.id}`),
          data,
        });
      }
      exerciseIds.push(exercise.id);
    }
  }

  const result = {
    success: null,
    total: exerciseIds.length,
    exerciseIds,
  };

  if (commands.length) {
    // write to db
    console.log(commands.length);
    const res = await applyUpdates(db, commands);
    result.success = (res === commands.length);

    if (!isAction) {
      // verify if changes is as expected
      let verifyNum = 0;
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const exerciseId = exerciseIds[i];
        const exerciseTemp = await getDocument(db.collection('exercises_temp').doc(exerciseId));
        // delete these properties added by getDocument
        delete exerciseTemp.id;
        delete exerciseTemp.ref;
        if (_.isEqual(exerciseTemp) === _.isEqual(command.data)) {
          console.log(`${i + 1}. ${exerciseId} is matching`);
          verifyNum++;
        }
      }
      result.verifyNum = verifyNum;
    }
  }

  return result;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
