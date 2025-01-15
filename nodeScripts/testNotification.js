'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initNotifications from '../functions/actions/notifications.js';
import initFactories from '../functions/shared/factories.js';
import { getDocument } from '../functions/shared/helpers.js';

const { testNotification } = initNotifications(config, firebase, db);
const { newNotificationCharacterCheckRequest } = initFactories(config);

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
