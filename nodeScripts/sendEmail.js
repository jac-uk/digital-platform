'use strict';
const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');

const { sendEmail } = require('../functions/shared/notify')(config, firebase, db);

const main = async () => {
  const templateId = 'c5c67b52-42ad-4fb8-a7ec-b93576c28c63';
  const email = 'tom.russell@judicialappointments.digital';
  const personalisation = { 
    fullName: 'ayyyy beece',
    exerciseId: '001',
    exerciseName: 'ABC',
    refNumber: 'ABC',
  };
  return sendEmail(email, templateId, personalisation);
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
