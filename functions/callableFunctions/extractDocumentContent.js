import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { firebase, db } from '../shared/admin.js';
import initExtractDocumentContent from '../shared/file-extraction/extractDocumentContent.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { extractDocumentContent } = initExtractDocumentContent(firebase);
const { checkFunctionEnabled } = initServiceSettings(db);

export default onCall(
  {
    region: 'europe-west2', // Specify the region
    memory: '512MiB',       // (Optional) Configure memory allocation
    timeoutSeconds: 240,    // (Optional) Configure timeout
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

      // generate the report
      const result = await extractDocumentContent(data.templatePath, data.documentPath, data.questions);

      // log an event
      // const exercise = await getDocument(db.collection('exercises').doc(data.exerciseId));
      // let details = {
      //   exerciseId: exercise.id,
      //   exerciseRef: exercise.referenceNumber,
      // };
      // let user = {
      //   id: request.auth.token.user_id,
      //   name: request.auth.token.name,
      // };
      // await logEvent('info', 'Agency report generated', details, user);

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
