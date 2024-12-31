'use strict';

import config from './shared/config.js';
import { app, db } from './shared/admin.js';
import initTaskHelpers from '../functions/actions/tasks/taskHelpers.js';
import { getDocument } from '../functions/shared/helpers.js';

const { createMarkingScheme } = initTaskHelpers(config);

const main = async () => {
  const exerciseId = '1qef6rsaSLvvsZHrJuw7';
  const taskType = 'selectionDay';
  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
  return createMarkingScheme(exercise, taskType);
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
 
