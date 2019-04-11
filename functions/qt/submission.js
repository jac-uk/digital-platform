const admin = require("firebase-admin");

// This throws exceptions rather than logging because we want to know as soon as these issues occur.  By throwing, we are
// ensuring they will appear in StackDriver Errors in an actionable way.
exports.createRecord = async (record) => {
  const firestore = admin.firestore();
  console.info({ createRecordCalled: record });

  // This function expects the test title to be in the following format:
  // "Optional Disambiguator (i.e. '128' or 'April 2019'): Test Name (i.e. RUCA): Test Phase (i.e. Situational Judgement)"
  const titleFormat = /^[^:]*:?\s*([^:]+):\s*([^:]+)$/;
  testDetails = record.title.match(titleFormat);
  if (testDetails === null) {
    throw new Error("Title is incorrectly formatted " + record.title);
  } else {
    record.testName = testDetails[1];
    record.testPhase = testDetails[2];
  }

  const user = await admin.auth().getUser(record.userId);

  const duplicates = await firestore.collection('qtSubmissions')
    .where("testName", "==", record.testName)
    .where("testPhase", "==", record.testPhase)
    .where("userId", "==", record.userId)
    .select()
    .limit(1)
    .get();

  // We don't need to check `user` as getUser will throw if the user isn't found.
  if (duplicates.size > 0) {
    throw new Error("Duplicate submission " + user.email);
  } else {
    record.createdAt = new Date();
    await firestore
      .collection('qtSubmissions')
      .doc()
      .set(record);
  }

  return true;
}

