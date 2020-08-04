'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { onAssessmentCompleted } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  const assessmentId = 'LZxWU3IM2DsaMg7Hb1qS-1';
  return onAssessmentCompleted(assessmentId);
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
