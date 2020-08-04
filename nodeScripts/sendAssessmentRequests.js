'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { sendAssessmentRequests } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  return sendAssessmentRequests({
    exerciseId: 'wdpALbyICL7ZxxN5AQt8',
    assessmentId: 'testData-10-1',
    resend: true,
  });

  // return sendAssessmentRequests({
  //   exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  //   assessmentIds: ['SGlHaffdfKLmzXlLT9eq-1', 'LZxWU3IM2DsaMg7Hb1qS-1'],
  // });

  // return sendAssessmentRequests({
  //   exerciseId: 'kJKbG9TOQToEzB4AlEV1',
  //   assessmentId: '7LYr1JYyKJcA0coETggQ-1',
  //   resend: true,
  // });

  // return sendAssessmentRequests({
  //   exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  // });
  // return sendAssessmentRequests({
  //   exerciseId: 'wdpALbyICL7ZxxN5AQt8',
  //   resend: true,
  // });
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
