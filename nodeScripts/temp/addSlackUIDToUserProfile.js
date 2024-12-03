'use strict';

import { app, auth, db, firebase } from '../shared/admin.js';
import config from '../shared/config.js';
import initSlack from '../../functions/actions/slack.js';

const slack = initSlack(auth, config, db, firebase);

// Details for 'Drie Contractor'
const appUserId = 'uq7S68mW3zTKd6duK9L94dIyu1B2';
const userEnteredSlackUID = 'U052NR5U43Z';

async function callSlackWebApi() {

  const success = await slack.lookupSlackUser(appUserId, userEnteredSlackUID, true);

  console.log('Slack response:');
  console.log(success);

  return success;
}

const main = async () => {
  return callSlackWebApi();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
