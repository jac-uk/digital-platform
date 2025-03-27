import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initExportSccSummaryReport from '../actions/exercises/sccSummaryReport.js';
import { getDocument } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportSccSummaryReport } = initExportSccSummaryReport(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
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
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
      ]);

      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }

      if (!(typeof data.format === 'string') || data.format.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
      }

      const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));

      if (!exercise) {
        throw new HttpsError('not-found', 'Excercise not found');
      }

      let details = {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
      };
      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name,
      };
      try {
        await logEvent('info', 'SCC Summary report exported (to ' + data.format + ')', details, user);
      } catch (error) {
        console.error('Error in function:', error);
        console.error('Error in function:', JSON.stringify(error));
        console.error('Error in function:', error.stack);
        throw new HttpsError('internal', 'An error occurred during execution');
      }

      return await exportSccSummaryReport(data.exerciseId, data.format, (data.status || null));
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
