const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require("notifications-node-client").NotifyClient;

// This throws exceptions rather than logging because we want to know as soon as these issues occur.  By throwing, we are
// ensuring they will appear in StackDriver Errors in an actionable way.
const createRecord = async (record) => {
  const firestore = admin.firestore();
  const client = new NotifyClient(functions.config().notify.key);

  console.info({ createRecordCalled: record });

  // This function expects the test title to be in the following format:
  // Test Name (i.e. April 2019 RUCA): Test Phase (i.e. Situational Judgement)"
  const titleFormat = /^(.+)\s*:\s*([^:]+)$/;
  testDetails = record.title.match(titleFormat);
  if (testDetails === null) {
    throw new Error("Title is incorrectly formatted " + record.title);
  } else {
    record.testName = testDetails[1];
    record.testPhase = testDetails[2];
  }

  const user = await admin.auth().getUser(record.userId);

  record.createdAt = new Date();
  await firestore
    .collection('qtSubmissions')
    .doc()
    .set(record);

  await client
    .sendEmail(
      functions.config().notify.templates.combined_qt_sj_submitted,
      user.email,
      {});
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

