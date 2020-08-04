'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
// const { getDocument } = require('../functions/shared/helpers');
const { processNotifications } = require('../functions/actions/notifications.js')(config, firebase, db);

const main = async () => {
  // const services = await getDocument(db.doc('settings/services'));
  // if (services.notifications === true) {
    return processNotifications();
  // }
  // return false;
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
