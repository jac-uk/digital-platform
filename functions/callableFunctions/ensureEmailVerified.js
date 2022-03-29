const admin = require('firebase-admin');
const functions = require('firebase-functions');

module.exports = functions.region('europe-west2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  try {
    const auth = admin.auth();
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
