const admin = require("firebase-admin");
const functions = require("firebase-functions");

exports = module.exports = functions.firestore.document("qtSubmissions/{submission}").onCreate((snapshot, context) => {
  const firestore = admin.firestore();
  const data = snapshot.data();
  const record = {
    [data.testName] :
    { [data.testPhase] :
      {
        finishedAt: data.createdAt
      }
    }
  };

  return firestore
    .collection("qtSummaries")
    .doc(data.userId)
    .set(record)
    .then(() => console.info(record))
    .catch(e => console.error({error: e, record}));
});

