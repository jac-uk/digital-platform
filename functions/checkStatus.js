/*
 * Quick and dirty status counter.
 *
 * To run:
 *
 * ```
 * export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 * cd functions
 * node checkStatus.js
 * ```
 *
 * Counts number of applications at each available status, nothing more.
 *
 */
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();
const count = {};

return firestore.collection('applications')
  .get()
  .then((snapshot) => {
    snapshot.forEach(doc => {
      const data = doc.data();
      if (count[data.state] === undefined) {
        count[data.state] = 1;
      } else {
        count[data.state] += 1;
      }
    });
    return console.log(JSON.stringify(count, null, 2));
  });


