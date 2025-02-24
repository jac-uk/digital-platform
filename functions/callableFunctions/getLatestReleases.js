import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../shared/admin.js';
import initServiceSettings from '../shared/serviceSettings.js';
const { checkFunctionEnabled } = initServiceSettings(db);
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initZenhub from '../shared/zenhub.js';

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
      //const data = request.data;

      await checkFunctionEnabled();

      // authenticate the request
      if (!request.auth) {
        throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
      }

      hasPermissions(request.auth.token.rp, [
        PERMISSIONS.releases.permissions.canReadReleases.value,
      ]);

      const zenhub = initZenhub(
        process.env.ZENHUB_GRAPH_QL_URL,
        process.env.ZENHUB_GRAPH_QL_API_KEY,
        process.env.GITHUB_PAT,
        process.env.ZENHUB_ISSUES_WORKSPACE_ID
      );

      return await zenhub.getLatestReleaseForRepositories();
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);

