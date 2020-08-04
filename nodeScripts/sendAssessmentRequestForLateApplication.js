'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const { initialiseAssessments, sendAssessmentRequests } = require('../functions/actions/assessments.js')(config, firebase, db);

const main = async () => {
  // const exerciseId = 'p4pcU9EQhvPf2AMF8hxZ';
  // const applicationId = 'JMgVqSz4TYxT4TfKD0E9';
  // await initialiseAssessments({
  //   exerciseId: exerciseId,
  //   applicationId: applicationId,
  // });
  // return sendAssessmentRequests({
  //   exerciseId: exerciseId,
  //   assessmentIds: [ `${applicationId}-1`, `${applicationId}-2` ],
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
