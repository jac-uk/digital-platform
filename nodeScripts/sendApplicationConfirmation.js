'use strict';

const config = require('./shared/config');
const { firebase, app, db, auth } = require('./shared/admin.js');
const { sendApplicationConfirmation } = require('../functions/actions/applications/applications')(config, firebase, db, auth);

const main = async () => {
  return sendApplicationConfirmation({
    items: ['00s0ozpcBangd7Yh3DHf'],
    exerciseId: '5r40soW2fFmv50UEmkxP',
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
