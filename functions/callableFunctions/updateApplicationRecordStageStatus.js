import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initUpdateApplicationRecordStageStatus from '../actions/applicationRecords/updateApplicationRecordStageStatus.js';
import { checkArguments } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initGenerateDiversityReport from '../actions/exercises/generateDiversityReport.js';
import initGenerateDiversityData from '../actions/exercises/generateDiversityData.js';
import initGenerateOutreachReport from '../actions/exercises/generateOutreachReport.js';

const { updateApplicationRecordStageStatus } = initUpdateApplicationRecordStageStatus(firebase, config, db);
const { checkFunctionEnabled } = initServiceSettings(db);
const { generateDiversityReport } = initGenerateDiversityReport(config, firebase, db);
const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { generateOutreachReport } = initGenerateOutreachReport(config, firebase, db);

export default functions.runWith({
  timeoutSeconds: 180,
  memory: '1GB',
}).region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  hasPermissions(context.auth.token.rp, [
    PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
    PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
  ]);

  // validate input parameters
  if (!checkArguments({
    exerciseId: { required: true },
    version: { required: true },
  }, data)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide valid arguments');
  }

  const result = await updateApplicationRecordStageStatus({
    exerciseId: data.exerciseId,
    version: data.version,
  });

  // refresh reports
  await generateDiversityReport(data.exerciseId);
  await generateDiversityData(data.exerciseId);
  await generateOutreachReport(data.exerciseId);

  // return the requested data
  return result;
});
