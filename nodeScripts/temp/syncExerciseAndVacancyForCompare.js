'use strict';

/**
 * Node script to synchronise several fields that have become out of sync between exercise and vacancy
 * which breaks the comparison between the two when showing changes during exercise approval process.
 * The vacancy fields need to adopt the value in the exercise.
 * The fields are:
 * aboutTheRoleWelsh, aSCApply, inviteOnly, previousJudicialExperienceApply, roleSummaryWelsh, welshPosts, welshRequirement, locationWelsh
 * 
 * Run with: > npm run local:nodeScript temp/syncExerciseAndVacancyForCompare
 */

import { app, db } from '../shared/admin.js';
import { getDocuments, getDocument, applyUpdates } from '../../functions/shared/helpers.js';
import { objectHasNestedProperty } from '../../functions/shared/helpers.js';

async function updateVacancies() {
  const commands = [];
  const exercises = await getDocuments(db.collection('exercises').select('welshRequirement', 'inviteOnly', 'previousJudicialExperienceApply', 'welshPosts', 'aboutTheRoleWelsh', 'aSCApply', 'roleSummaryWelsh', 'locationWelsh'));
  for (let i = 0, len = exercises.length; i < len; ++i) {
    const exercise = exercises[i];

    // Check if data exists in exercises
    const hasWR = objectHasNestedProperty(exercise, 'welshRequirement');
    const hasIO = objectHasNestedProperty(exercise, 'inviteOnly');
    const hasPJEA = objectHasNestedProperty(exercise, 'previousJudicialExperienceApply');
    const hasWP = objectHasNestedProperty(exercise, 'welshPosts');
    const hasATRW = objectHasNestedProperty(exercise, 'aboutTheRoleWelsh');
    const hasAA = objectHasNestedProperty(exercise, 'aSCApply');
    const hasRSW = objectHasNestedProperty(exercise, 'roleSummaryWelsh');
    const hasLW = objectHasNestedProperty(exercise, 'locationWelsh');

    if (hasWR || hasIO || hasPJEA || hasWP || hasATRW || hasAA || hasRSW || hasLW) {
      const vacancy = await getDocument(db.doc(`vacancies/${exercise.id}`));
      if (vacancy) {
        console.log(`vacancy id: ${vacancy.id}`);
        console.log(`vacancy ref: ${vacancy.ref}`);
  
        const data = {};
        if (hasWR) {
          data.welshRequirement = exercise.welshRequirement;
        }
        if (hasIO) {
          data.inviteOnly = exercise.inviteOnly;
        }
        if (hasPJEA) {
          data.previousJudicialExperienceApply = exercise.previousJudicialExperienceApply;
        }
        if (hasWP) {
          data.welshPosts = exercise.welshPosts;
        }
        if (hasATRW) {
          data.aboutTheRoleWelsh = exercise.aboutTheRoleWelsh;
        }
        if (hasAA) {
          data.aSCApply = exercise.aSCApply;
        }
        if (hasRSW) {
          data.roleSummaryWelsh = exercise.roleSummaryWelsh;
        }
        if (hasLW) {
          data.locationWelsh = exercise.locationWelsh;
        }
  
        commands.push({
          command: 'update',
          ref: vacancy.ref,
          data: data,
        });
      }
    }
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? exercises.length : false;
}

const main = async () => {
  return updateVacancies();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
