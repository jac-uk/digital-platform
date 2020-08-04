'use strict';

const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin.js');
const { emptyNotificationsQueue } = require('../functions/actions/notifications.js')(config, firebase, db);

const main = async () => {
  // TODO this wipes everything from the queue... we should support targeting subsets in the queue
  return emptyNotificationsQueue();
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
