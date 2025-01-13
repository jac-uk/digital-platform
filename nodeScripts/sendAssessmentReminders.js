'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initAssessments from '../functions/actions/assessments.js';

const { cancelAssessments } = initAssessments(config, firebase, db);

const main = async () => {
  return cancelAssessments({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  });
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
