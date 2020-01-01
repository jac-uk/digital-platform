const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

const NotifyClient = require('notifications-node-client').NotifyClient;

// This can only be invoked once in firebase functions, and this is why we have to put it here
admin.initializeApp();

const db = admin.firestore();

//
// helper function to use gov.uk Notify to send emails
//
const sendEmail = (email, templateId, personalisation) => {
  const client = new NotifyClient(functions.config().notify.key);

  console.info({
    action: 'Sending email',
    email,
    templateId,
    personalisation,
  });

  return client
    .sendEmail(
      templateId,
      email,
      {personalisation}
    )
    .then(notifyResponse => {
      console.info(notifyResponse.body);
      return true;
    });
};

//
// helper function that checks if an email address has a valid format
//
const emailIsValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

//
// helper function to get data with collectionName and docId
//
const getData = async (collectionName, docId) => {
  const ref = db.collection(collectionName).doc(docId);
  let data = ref.get()
    .then(doc => {
      if (!doc.exists) {
        console.error(`ERROR: No such document (${docId}) in collection (${collectionName})`);
        return null;
      }

      return doc.data();
    })
    .catch(err => {
      console.error('Error getting document', err);
      return null;
    });  
  return data;
};

//
// helper function to set data with collectionName and docId
//
const setData = async (collectionName, docId, data) => {
  const ref = db.collection(collectionName).doc(docId);

  const debugMsg = `
    collectionName: ${collectionName}
    docId: ${docId}
  `;

  // withMerge doesn't overwrite doc if it already exists
  const response = await ref.set(data, {merge: true})
    .then(() => {
      console.log('Document successfully written: ', debugMsg);
      console.log('data: ', data);
      return true;
    })
    .catch(err => {
      console.error('Error writing document: ', err, debugMsg);
      return false;
    });
  return response;
};

//
//  helper function to log a string to Slack channel #prod-alerts
//
const slog = async (msgString) => {
  console.log(msgString);

  // Check that the firebase config has the key by running:
  // firebase functions:config:get
  //
  // Set slack.url in firebase functions like this:
  // firebase functions:config:set slack.url="YOUR_SLACK_INCOMING_WEBHOOK_URL"  
  const slackUrl = functions.config().slack.url;

  const data = {
    text: msgString,
  };
  
  // we wait for the axios.post Promise to be resolved
  const result = await axios.post(slackUrl, data);
  return result;
};

//
// helper function to get exercises matching a particular date
// Used to monitor exercise timeline dates which triggers certain actions like:
// - send email notifications
// - change application statuses
//
const getExercisesWithDate = async (dateFieldName) => {
  const today = new Date();
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  slog(`
    SCHEDULED JOB: Looking for exercises where ${dateFieldName} = ${today}
  `);

  let exercisesRef = db.collection('exercises');

  let snapshot;
  try {
    snapshot = await exercisesRef.where(dateFieldName, '>', yesterday).where(dateFieldName, '<', today).get(); 
  } catch(err) {
    slog(`
      ERROR: Bad query: exercisesRef.where(${dateFieldName}, '>', yesterday).where(${dateFieldName}, '<', today).get() :
    `, err);
    return null;
  }

  if (snapshot.empty) {
    slog(`No matching documents in Exercises 
      where ${dateFieldName} > ${yesterday}
      and ${dateFieldName} < ${today}`);
    return null;
  }

  return snapshot;
};


module.exports = {
  db,
  sendEmail,
  emailIsValid,
  getData,
  slog,
  setData,
  getExercisesWithDate, 
};
