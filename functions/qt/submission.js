const admin = require("firebase-admin");
const functions = require("firebase-functions");

const createRecord = async (record) => {
  const firestore = admin.firestore();

  record.finishedAt = admin.firestore.FieldValue.serverTimestamp();

  const userTest = firestore
    .collection("usersTests")
    .doc(record["Unique reference code - for JAC use only"]);

  record.userTest = userTest;

  const uts = firestore
    .collection("userTestSubmissions")
    .doc()

  await uts.set(record);
  console.info({ createdUserTestSubmission: uts.id });

  /*
   * We only record the `finishedAt` time for the *first* submission. In the event of duplicate submissions, we save the each
   * additional one and count the number of duplicates in the `usersTests` record. We do not update the `finishedAt`
   * timestamp again.
   *
   */
  const userTestDoc = await userTest.get();
  if (userTestDoc.exists) {
    if (userTestDoc.data().finishedAt === undefined) {
      await userTest.set({finishedAt: record.finishedAt}, {merge: true});
      console.info({updatedUsersTests: userTest.id});
    } else {
      const increment = admin.firestore.FieldValue.increment(1);
      userTest.update({duplicateSubmissions: increment});
      console.info({updatedUsersTests: userTest.id, DuplicateSubmission: true});
    }
  }

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

