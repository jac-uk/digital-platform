const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require("notifications-node-client").NotifyClient;

const createUserTestSubmission = async (record, firestore) => {
  const finishedAt = admin.firestore.FieldValue.serverTimestamp();
  record.finshedAt = finishedAt;

  const userTest = firestore
    .collection("usersTests")
    .doc(record["Unique reference code - for JAC use only"]);

  record.userTest = userTest;

  const userTestSubmission = firestore
    .collection("userTestSubmissions")
    .doc();

  await userTestSubmission.set(record);
  console.info({createdUserTestSubmission: userTestSubmission.id, usersTests: userTest.id});

  return { finishedAt, userTest }
}

const updateUsersTests = async (userTestData, firestore) => {
  /*
   * We only record the `finishedAt` time for the *first* submission. In the event of duplicate submissions, we save each
   * additional record and log the number of duplicates. We do not update the `finishedAt` timestamp
   *
   */
  const userTest = userTestData.userTest;
  const userTestDoc = await userTest.get();
  if (userTestDoc.exists) {
    const data = userTestDoc.data();
    if (data.finishedAt === undefined) {
      await userTest.set({finishedAt: userTestData.finishedAt}, {merge: true});
      console.info({updatedUsersTests: userTest.id});
      return data;
    } else {
      console.warn({updatedUsersTests: userTest.id, duplicateSubmission: true});
    }
  } else {
    console.warn({updatedUsersTests: undefined, unattributableSubmission: true});
  }
  return undefined;
}

const sendConfirmationEmail = async (userTestDocData, confirmationTemplate) => {
  const client = new NotifyClient(functions.config().notify.key);
  const user = await admin.auth().getUser(userTestDocData.userUid);
  const personalisation = {firstname: user.displayName};
  await client.sendEmail(confirmationTemplate, user.email, {personalisation});
  console.info({sentConfirmationEmail: user.email});
  return true;
}

const main = async (record) => {
  const firestore = admin.firestore();
  const userTestData = await createUserTestSubmission(record, firestore);
  const userTestDocData = await updateUsersTests(userTestData, firestore);

  // No point sending duplicate emails/trying to send emails to non-existent users.
  if (userTestDocData !== undefined) {
    await sendConfirmationEmail(userTestDocData, record.confirmationTemplate);
  }
  return true;
}

module.exports = functions.https.onRequest((request, response) => {
  return main(request.body)
    .then(() => {
      return response.status(200).send({status: 'OK'});
    })
    .catch((e) => {
      console.error(e);
      return response.status(500).send({status: 'Error'});
    });
});

