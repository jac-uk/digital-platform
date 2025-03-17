import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db, auth } from '../shared/admin.js';
import initServiceSettings from '../shared/serviceSettings.js';
import initGenerateDiversityReport from '../actions/exercises/generateDiversityReport.js';
import initGenerateDiversityData from '../actions/exercises/generateDiversityData.js';

import { getDocument } from '../shared/helpers.js';
import initLogEvent from '../actions/logs/logEvent.js';

import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';

const { logEvent } = initLogEvent(firebase, db, auth);
const { checkFunctionEnabled } = initServiceSettings(db);
const { generateDiversityReport } = initGenerateDiversityReport(firebase, db);
const { generateDiversityData } = initGenerateDiversityData(firebase, db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '512MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth?.uid) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.exercises.permissions.canReadExercises.value,
        PERMISSIONS.applications.permissions.canReadApplications.value,
        PERMISSIONS.applicationRecords.permissions.canReadApplicationRecords.value,
      ]);

      // validate input parameters
      if (!(typeof data.exerciseId === 'string') || data.exerciseId.length === 0) {
        throw new HttpsError('invalid-argument', 'Please specify an "exerciseId"');
      }

      // generate the report
      const result = await generateDiversityReport(data.exerciseId);

      // generate diversity data
      // TODO this is here temporarily. Sort it out!
      await generateDiversityData(data.exerciseId);

      // log an event
      const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
      let details = {
        exerciseId: exercise.id,
        exerciseRef: exercise.referenceNumber,
      };
      let user = {
        id: request.auth.token.user_id,
        name: request.auth.token.name,
      };
      await logEvent('info', 'Diversity report generated', details, user);

      // return the report to the caller
      return {
        result: result,
      };
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
