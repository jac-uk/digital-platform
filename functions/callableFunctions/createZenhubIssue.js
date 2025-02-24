import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initCreateIssue from '../actions/zenhub/createIssue.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '256MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
    minInstances: 0,        // (Optional) Min instances to reduce cold starts
    maxInstances: 10,       // (Optional) Max instances to scale
    secrets: [
      'ZENHUB_GRAPH_QL_API_KEY',
      'GITHUB_PAT',
      'ZENHUB_ISSUES_WORKSPACE_ID',
    ],  // ✅ Ensure the function has access to the secrets
  },
  async (request) => {

    try {
      const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }
      // Validate @judicialappointments.gov.uk and @judicialappointments.digital
      const validEmailPattern = /@judicialappointments\.gov\.uk$|@judicialappointments\.digital$/;
      if (!validEmailPattern.test(request.auth.token.email)) {
        throw new HttpsError('failed-precondition', 'The function is restricted to JAC Staff.');
      }

      const { createIssue } = initCreateIssue(firebase, db);

      return await createIssue(data.bugReportId, data.userId);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);

