/*
 *
 * To run:
 *
 * ```
 * export GOOGLE_CLOUD_PROJECT=application-form-e08c9
 * cd functions
 * node exportSubmitted.js
 * ```
 *
 * Counts number of applications at each available status, nothing more.
 *
 */
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();
// This will be deprecate soon and throws warnings.  For now, though, it is
// easier than trying to recursively parse the data structure looking for
// firestore Timestamps.
firestore.settings({timestampsInSnapshots: false});

const related = (collection, rid) => {
  return firestore.collection(collection)
    .get(rid)
    .then(snap => {
      records = {}
      const data = snap.data();
      Object.getOwnPropertyNames(data).sort().forEach((key) => {
       records[key] = snap.get(key);
      });
      return records;
    })
    .catch(e => console.warn(e));
}

firestore.collection('applications')
  .get()
  .then(snapshot => {
    const records = {};
    snapshot.forEach((snap) => {
      if (snap.get('state') === 'submitted') {
        const data = snap.data();
        const aid = snap.get('applicant').id;
        records[aid] = { application: {} };

        Object.getOwnPropertyNames(data).sort().forEach((key) => {
          if (key !== 'applicant' && key !== 'vacancy') {
            records[aid]['application'][key] = snap.get(key);
          }
        });
      }
    });
    return records;
  })
  .then((records) => {
    return console.log(JSON.stringify(records, null, 2));
  })
  .catch(e => console.warn(e));

