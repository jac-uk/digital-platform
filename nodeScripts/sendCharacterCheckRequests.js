'use strict';

import config from './shared/config.js';
import { firebase, app, db, auth } from './shared/admin.js';
import initApplications from '../functions/actions/applications/applications.js';

const { sendCharacterCheckRequests } = initApplications(config, firebase, db, auth);

const main = async () => {
  return sendCharacterCheckRequests({
    items: ['number'],
    type: 'request',
    exerciseMailbox: 'email address',
    exerciseManagerName: 'Tom Jones',
    dueDate: '30/06/2021',
  });
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
