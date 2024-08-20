'use strict';

import { app, auth } from './shared/admin.js';
import initUpdateEmailAddress from '../functions/actions/candidates/updateEmailAddress.js';

const updateEmailAddress = initUpdateEmailAddress(auth);

const main = async () => {
  return updateEmailAddress({
    currentEmailAddress: 'enter email here',
    newEmailAddress: 'enter email here',
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
