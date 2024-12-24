'use strict';

import config from './shared/config.js';
import { firebase, app, db, auth } from './shared/admin.js';
import initUsers from '../functions/actions/users.js';

const { createFirebaseEmailLink } = initUsers(auth, db, config);

const main = async () => {
  return createFirebaseEmailLink({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eSI6IjM3YWYyY2I5MWU4NmRhMTU5ODUwNDk1ZjU0MDk1MjdmODI4YmFmY2YiLCJyZWYiOiJhc3Nlc3NtZW50cy95UFBlRm5IZWNtbG1RVVd2dUVhbC0xIiwiaWF0IjoxNzM1MDQxOTA5LCJleHAiOjE3MzUwNDIyMDl9.p32dfq-mB-zS_6R5yORTIpEkB8YEyj8t_wNTMIWLuYg',
    returnUrl: 'https://assessments-develop.judicialappointments.digital/sign-in',
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
