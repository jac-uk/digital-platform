const functions = require('firebase-functions');
const { auth } = require('../shared/admin');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  try {
    const uid = context.auth.uid;
    const user = await auth.getUser(uid);
    if (user.emailVerified === false) {
      await auth.updateUser(uid, {
        emailVerified: true,
      });
    }
  } catch (e) {
    throw new functions.https.HttpsError('unknown', e);
  }
  return {};
});
