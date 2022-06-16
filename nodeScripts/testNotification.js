'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { testNotification } = require('../functions/actions/notifications')(config, firebase, db);
const { newNotificationCharacterCheckRequest } = require('../functions/shared/factories')(config);
const { getDocument } = require('../functions/shared/helpers');

const main = async () => {
  const applicationId = 'xmnLGyEmaQd2w18BnCJP';
  const type = 'submit';
  const exerciseMailbox = 'email';
  const exerciseManagerName = 'email';
  const dueDate = '16/06/2022';
  const email = 'email';

  const application = await getDocument(db.collection('applications').doc(applicationId));
  const notification = newNotificationCharacterCheckRequest(firebase, application, type, exerciseMailbox, exerciseManagerName, dueDate);
  return testNotification(notification, email);
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
