'use strict';

import { app, db } from './shared/admin.js';
import initGenerateSelectionDayTimetable from '../functions/actions/tasks/generateSelectionDayTimetable.js';

const generateSelectionDayTimetable = initGenerateSelectionDayTimetable(db);
const exerciseId = 'onQnYkljJBuE5x7ntAwd';

const main = async () => {
  if (!exerciseId) {
    throw new Error('Please specify an "exerciseId"');
  }
  return await generateSelectionDayTimetable(exerciseId);
};

main()
  .then((result) => {
    result;
    console.log('result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
