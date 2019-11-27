const functions = require('firebase-functions');
const admin = require('firebase-admin');

const NotifyClient = require('notifications-node-client').NotifyClient;

// This can only be invoked once in firebase functions, and this is why we have to put it here
admin.initializeApp();

const db = admin.firestore();

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

const emailIsValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// helper function to get data with collectionName and docId
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

module.exports = {
  db,
  sendEmail,
  emailIsValid,
  getData,
};
