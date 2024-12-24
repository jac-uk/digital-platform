'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initAssessments from '../functions/actions/assessments.js';

const { sendAssessmentRequests } = initAssessments(config, firebase, db);

const main = async () => {
  return sendAssessmentRequests({
    exerciseId: 'Biyjd07Xz2usL9yXjtjV',
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
