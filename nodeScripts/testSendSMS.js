'use strict';

import { firebase, app } from './shared/admin.js';
import initFactories from '../functions/shared/factories.js';
import initNotify from '../functions/shared/notify.js';

const { sendSMS } = initNotify();
const { newSmsNotificationLoginVerificationNumber } = initFactories();

const mobile = '';
const verificationCode = '12345';

const main = async () => {
  if (!mobile || !verificationCode) {
    throw new Error('Please provide a mobile number and verification number.');
  }

  try {
    const notification = newSmsNotificationLoginVerificationNumber(firebase, mobile, verificationCode);
    return await sendSMS(notification.mobile, notification.template.id, notification.personalisation);
  } catch (error) {
    console.error(error);
  }
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
