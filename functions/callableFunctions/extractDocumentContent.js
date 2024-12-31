import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase, db } from '../shared/admin.js';
import initExtractDocumentContent from '../shared/file-extraction/extractDocumentContent.js';
import initServiceSettings from '../shared/serviceSettings.js';

const { extractDocumentContent } = initExtractDocumentContent(config, firebase);
const { checkFunctionEnabled } = initServiceSettings(db);

export default functions.region('europe-west2').https.onCall(async (data, context) => {
  await checkFunctionEnabled();

  // authenticate the request
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
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
  //   id: context.auth.token.user_id,
  //   name: context.auth.token.name,
  // };
  // await logEvent('info', 'Agency report generated', details, user);

  // return the report to the caller
  return {
    result: result,
  };

});
