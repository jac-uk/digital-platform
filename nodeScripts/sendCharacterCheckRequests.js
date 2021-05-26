'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { sendCharacterCheckRequests } = require('../functions/actions/applications/applications')(config, firebase, db);

const main = async () => {
  return sendCharacterCheckRequests({
    items: ['xd3h9f5bouU7IYQaWcH8'],
    type: 'request',
    exerciseMailbox: 'maria.brookes@judicialappointments.digital',
    exerciseManagerName: 'Maria Brookes',
    dueDate: '30 June 2021',
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
