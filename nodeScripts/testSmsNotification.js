'use strict';

import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initFactories from '../functions/shared/factories.js';
import { applyUpdates } from '../functions/shared/helpers.js';
const { newSmsNotificationLoginVerificationNumber } = initFactories(config);

const main = async () => {

const mobileNumber = '+447971000000';
const verificationNumber = '12345';

// Send the verification email
const commands = [];
commands.push({
  command: 'set',
  ref: db.collection('notifications').doc(),
  data: newSmsNotificationLoginVerificationNumber(firebase, mobileNumber, verificationNumber),
});

const result = await applyUpdates(db, commands);

console.log(`result: ${result}`);

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
