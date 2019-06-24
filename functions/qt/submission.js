const admin = require("firebase-admin");
const functions = require("firebase-functions");

const createRecord = async (record) => {
  const firestore = admin.firestore();

  record.finishedAt = admin.firestore.FieldValue.serverTimestamp();

  const userTest = firestore
    .collection("usersTests")
    .doc(record["Unique reference code - for JAC use only"]);
  record.userTest = userTest;

  const uts = await firestore
    .collection("userTestSubmissions")
    .doc()
    .set(record);

  console.info({ createdUserTestSubmission: uts.id });
  return true;
}

module.exports = functions.https.onRequest((request, response) => {
  return createRecord(request.body)
    .then(() => {
      return response.status(200).send({status: 'OK'});
    })
    .catch((e) => {
      console.error(e);
      return response.status(500).send({status: 'Error'});
    });
});

