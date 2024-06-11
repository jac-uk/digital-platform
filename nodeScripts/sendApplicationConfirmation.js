'use strict';

const config = require('./shared/config');
const { app, db, auth, storage } = require('./shared/admin.js');
const { sendApplicationConfirmation } = require('../functions/actions/applications/applications')(config, db, auth, storage);

const main = async () => {
  return sendApplicationConfirmation({
    applicationId: '00s0ozpcBangd7Yh3DHf',
    application: {
      id: '00s0ozpcBangd7Yh3DHf',
      exerciseId: '5r40soW2fFmv50UEmkxP',
      exerciseName: 'Test Exercise',
      referenceNumber: 'JAC00001-xxx0000',
      personalDetails: {
        email: 'application@jac-dummy-email.jac',
        fullName: 'Test',
      },
    },
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
