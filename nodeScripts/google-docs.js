'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument } = require('../functions/shared/helpers');
const { google } = require('googleapis');

const main = async () => {
  const application = await getDocument(db.collection('applications').doc('testData-1'));

  const auth = await google.auth.getClient({
    scopes: [ 'https://www.googleapis.com/auth/documents' ],
  });
  const docs = google.docs({ version: 'v1', auth });
  await docs.documents.batchUpdate({
    documentId: '10e-mWyfN8_hi_-ealc6wib3kyy_MzmpB102zKOqC2U8',
    requestBody: {
      requests: [
        {
          insertText: {
            location: {
              index: 1,
            },
            text: `Hello from ${application.personalDetails.fullName}\n`,
          },
        },
      ],
    },
  });
  return true;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
