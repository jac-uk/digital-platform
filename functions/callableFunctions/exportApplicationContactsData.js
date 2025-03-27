import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initExportApplicationContactsData from '../actions/exercises/exportApplicationContactsData.js';
import { getDocument, checkArguments } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportApplicationContactsData } = initExportApplicationContactsData(firebase, db);
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
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
      ]);

      // validate input parameters
      if (!checkArguments({
        exerciseId: { required: true },
        status: { required: true },
        processingStage: { required: false },
        processingStatus: { required: false },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      // log an event
      const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
      let details = {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
        status: data.status,
      };
      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name,
      };
      await logEvent('info', 'Application contacts exported', details, user);

      // return the requested data
      return await exportApplicationContactsData({
        exerciseId: data.exerciseId,
        status: data.status,
        processingStage: data.processingStage,
        processingStatus: data.processingStatus,
      });
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
