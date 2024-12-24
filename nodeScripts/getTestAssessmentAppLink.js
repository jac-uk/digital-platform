'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initAssessments from '../functions/actions/assessments.js';

const { getTestAssessmentAppLink } = initAssessments(config, firebase, db);

const main = async () => {
  return getTestAssessmentAppLink({
    assessmentId: 'yPPeFnHecmlmQUWvuEal-1',
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
