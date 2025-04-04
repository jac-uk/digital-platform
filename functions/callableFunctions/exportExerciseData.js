import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { checkArguments } from '../shared/helpers.js';
import { firebase, db, auth } from '../shared/admin.js';
import initExportExerciseData from '../actions/exercises/exportExerciseData.js';
import { getAllDocuments } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';
import initServiceSettings from '../shared/serviceSettings.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { exportExerciseData } = initExportExerciseData(db);
const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '1GiB',          // (Optional) Configure memory allocation
    timeoutSeconds: 180,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    enforceAppCheck: true,
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
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
      ]);

      // validate input parameters
      if (!checkArguments({
        exerciseIds: { required: true },
      }, data)) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }

      // generate the export
      const result = await exportExerciseData(data.exerciseIds);

      // log an event
      const exerciseRefs = data.exerciseIds.map(id => db.collection('exercises').doc(id));
      const exercises = await getAllDocuments(db, exerciseRefs);
      let details = {
        exercises: [],
      };
      exercises.forEach(exercise => {
        details.exercises.push({
          exerciseId: exercise.id,
          exerciseRef: exercise.referenceNumber,
        });
      });
      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name,
      };
      await logEvent('info', 'Exercises exported', details, user);

      // return the report to the caller
      return result;
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
