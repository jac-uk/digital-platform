const admin = require('firebase-admin');
const functions = require('firebase-functions');
const NotifyClient = require('notifications-node-client').NotifyClient;

const REFERENCE_FIELD_NAME = 'Unique reference code - for JAC use only';

const sendConfirmationEmail = async (userTestDocData, confirmationTemplate) => {
  const client = new NotifyClient(functions.config().notify.key);
  const user = await admin.auth().getUser(userTestDocData.userUid);
  const personalisation = {firstname: user.displayName};
  
  await client.sendEmail(confirmationTemplate, user.email, {personalisation});
  
  console.info({sentConfirmationEmail: user.email});
}

async function getUserTest(firestore, record) {
  const userTest = await firestore.collection('usersTests').doc(record[REFERENCE_FIELD_NAME]);
  const userTestDoc = await userTest.get();
  return { userTest, userTestDoc };
}

async function updateUserTestDoc(userTest, userTestDoc, finishedAtTimestamp) {
  const data = userTestDoc.data();

  /*
   * We only record the `finishedAt` time for the *first* submission. In the event of duplicate submissions,
   * we log duplicates, without updating `finishedAt` timestamp.  
   *
   */
  if (!data.finishedAt) {
    await userTest.set({finishedAt: finishedAtTimestamp}, {merge: true});
    
    console.info({updatedUsersTests: userTest.id});
    return data;
  } else {
    console.warn({updatedUsersTests: userTest.id, duplicateSubmission: true});
  }
}

async function updateUserTestSubmission(firestore, record) {
  const userTestSubmission = firestore.collection('userTestSubmissions').doc();
  await userTestSubmission.set(record);

  return userTestSubmission
}

const main = async (record) => {
  const firestore = admin.firestore();
  const { userTest, userTestDoc } = await getUserTest(firestore, record);

  if (userTestDoc.exists) {
    const finishedAtTimestamp = admin.firestore.FieldValue.serverTimestamp();
    const updatedRecord = { ...record, userTest, finishedAt: finishedAtTimestamp };

    const userTestDocData = await updateUserTestDoc(userTest, userTestDoc, finishedAtTimestamp);

    if (userTestDocData) {
      const userTestSubmission = await updateUserTestSubmission(firestore, updatedRecord);
      console.info({createdUserTestSubmission: userTestSubmission.id, usersTest: userTest.id});
      
      await sendConfirmationEmail(userTestDocData, record.confirmationTemplate);
    }
  } else {
    console.warn({updatedUsersTests: 'missing', unattributableSubmission: true});
  }
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
