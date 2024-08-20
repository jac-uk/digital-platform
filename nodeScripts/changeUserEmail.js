'use strict';

import { app, auth } from './shared/admin.js';

const main = async () => {
  try {
    const emailBefore = 'warren2@precise-minds.co.uk';
    const emailAfter = 'warren@precise-minds.co.uk';
    const user = await auth.getUserByEmail(emailBefore);
    return auth.updateUser(user.uid, { email: emailAfter });
  } catch(e) {
    // console.log(e);
    return false;
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
