import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, auth } from '../shared/admin.js';
import { checkArguments } from '../shared/helpers.js';
import { PERMISSIONS, hasPermissions } from '../shared/permissions.js';
import initUsers from '../actions/users.js';

const { deleteUsers } = initUsers(auth, db);

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
        PERMISSIONS.users.permissions.canDeleteUsers.value,
      ]);
    
      if (!checkArguments({ uids: { required: true } }, data) || !Array.isArray(data.uids) || data.uids.length === 0) {
        throw new HttpsError('invalid-argument', 'Please provide valid arguments');
      }
    
      return await deleteUsers(data.uids);
    }
    catch (error) {
      console.error('Error in function:', error);
      throw new HttpsError('internal', 'An error occurred during execution');
    }
  }
);
