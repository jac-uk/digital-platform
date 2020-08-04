'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { sendEmail, previewEmail } = require('./shared/notify.js')(config);
const { previewNotification } = require('../functions/actions/notifications.js')(db, sendEmail, previewEmail);

const main = async () => {
  return previewNotification('5bd78bc3-5d3b-4cdf-88f5-2daba5464719');
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
