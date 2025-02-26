'use strict';

import { firebase, app, db } from './shared/admin.js';
import initFlagApplicationIssues from '../functions/actions/applications/flagApplicationIssues.js';

const { flagApplicationIssuesForExercise } = initFlagApplicationIssues(firebase, db);

const main = async () => {
  return flagApplicationIssuesForExercise('wdpALbyICL7ZxxN5AQt8');
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
