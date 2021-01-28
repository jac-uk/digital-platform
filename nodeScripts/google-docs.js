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
            text: `Welsh posts - TEST1 Applying for a Welsh post ${toYesNo(application.applyingForWelshPost)} \n`,
            },
          },
        {
          insertText: {
            location: {
              index: 1,
            },
            text: `Welsh posts - TEST2 Applying for a Welsh post ${toYesNo(application.applyingForWelshPost)} \n`,
          },
        },
        {
          updateTextStyle: {
            range: {
              startIndex: 1,
              endIndex: 12,
            },
            textStyle: {
              bold: true,
              backgroundColor: {
                color: {
                  rgbColor: {
                    red: 0.3,
                    green: 0.5,
                    blue: 0.9,
                  },
                },
              },
            },
            fields: '*',
          },
        },
      ],
    },
  });
  return true;
};

const toYesNo = (input) => {
  return input ? 'Yes' : 'No';
}

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
