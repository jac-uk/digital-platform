'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { sendAssessmentReminders } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  // return sendAssessmentReminders({
  //   exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  //   assessmentId: 'SGlHaffdfKLmzXlLT9eq-1',
  // });
  // return sendAssessmentReminders({
  //   exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  //   assessmentIds: ['SGlHaffdfKLmzXlLT9eq-1', 'LZxWU3IM2DsaMg7Hb1qS-1'],
  // });
  return sendAssessmentReminders({
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
