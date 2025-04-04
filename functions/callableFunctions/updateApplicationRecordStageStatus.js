import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initUpdateApplicationRecordStageStatus from '../actions/applicationRecords/updateApplicationRecordStageStatus.js';
import { checkArguments } from '../shared/helpers.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initGenerateDiversityReport from '../actions/exercises/generateDiversityReport.js';
import initGenerateDiversityData from '../actions/exercises/generateDiversityData.js';
import initGenerateOutreachReport from '../actions/exercises/generateOutreachReport.js';

const { updateApplicationRecordStageStatus } = initUpdateApplicationRecordStageStatus(firebase, db);
const { checkFunctionEnabled } = initServiceSettings(db);
const { generateDiversityReport } = initGenerateDiversityReport(firebase, db);
const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { generateOutreachReport } = initGenerateOutreachReport(firebase, db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '1GiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 180,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    enforceAppCheck: true,
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
        PERMISSIONS.applicationRecords.permissions.canUpdateApplicationRecords.value,
      ]);

      // validate input parameters
      if (!checkArguments({
        exerciseId: { required: true },
        version: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
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
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
