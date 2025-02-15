import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getDocument } from '../shared/helpers.js';
import { firebase, db, auth } from '../shared/admin.js';
import initExportApplicationCharacterIssues from '../actions/exercises/exportApplicationCharacterIssues.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationCharacterIssues } = initExportApplicationCharacterIssues(firebase, db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '512MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 180,    // (Optional) Configure timeout
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
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.exercises.permissions.canReadExercises.value,
      ]);
    
      // validate input parameters
      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }
      if (!(typeof data.format === 'string') || data.format.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify a data format (excel or googledoc)');
      }
    
      // fetch the requested data
      const result = await exportApplicationCharacterIssues(data.exerciseId, data.stage || 'all', data.status || 'all', data.format);
    
      // log character generation report generation request
      const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
      let details = {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
      };
      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name,
      };
      await logEvent('info', 'Application character issues exported (to ' + data.format + ')', details, user);
    
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
