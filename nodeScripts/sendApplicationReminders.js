'use strict';

import { firebase, app, db, auth } from './shared/admin.js';
import initApplications from '../functions/actions/applications/applications.js';

const { sendApplicationReminders } = initApplications(firebase, db, auth);

const main = async () => {
  return sendApplicationReminders({
    exerciseId: '',
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
