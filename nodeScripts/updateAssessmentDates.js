/*
 * This script is used to update the assessment due date/hard limit dates
 * It updates the dates in the exericse and the assessments
 * Optionally pass either or both of the following (set to null otherwise)
 */

'use strict';

const { app, db } = require('./shared/admin');
const { applyUpdates, getDocuments, getDocument } = require('../functions/shared/helpers');

// Live
const exerciseId = 'lB0dht6mY4kSXTQusGqd';
const dueDate = new Date('2024-04-25');
const hardLimitDate = new Date('2024-05-01');

// Develop
// const exerciseId = '8CIlAsDbtMfr2vnfjmYh';
// const dueDate = new Date('2024-11-20');
// const hardLimitDate = new Date('2024-11-21');

const main = async () => {

  if (!dueDate && !hardLimitDate) {
    console.log('Please set either the dueDate or the hardLimitDate');
    return true;
  }

  // Get exercise
  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

  // Get all assessments for the exercise
  console.log('-- Fetching assessments...');

  const assessments = await getDocuments(db.collection('assessments').where('exercise.id', '==', exerciseId));
  console.log(`-- Fetched assessments: ${assessments.length}`);
  const commands = [];

  // Assessments
  console.log('-- Processing assessments...');
  for (let i = 0; i < assessments.length; i++) {
    const assessment = assessments[i];
    const data = {};
    if (dueDate) {
      data.dueDate = dueDate;
    }
    if (hardLimitDate) {
      data.hardLimitDate = hardLimitDate;
    }
    commands.push({
      command: 'update',
      ref: assessment.ref,
      data: data,
    });
  }

  // Exercise
  const exerciseData = {};
  if (dueDate) {
    exerciseData.independentAssessmentsReturnDate = dueDate;
  }
  if (hardLimitDate) {
    exerciseData.independentAssessmentsHardLimitDate = hardLimitDate;
  }
  commands.push({
    command: 'update',
    ref: exercise.ref,
    data: exerciseData,
  });

  if (commands.length) {
    const res = await applyUpdates(db, commands);
    console.log(`-- Updated exercise and assessments: ${res}`);
    return res;
  }

  return '-- No changes made';
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
