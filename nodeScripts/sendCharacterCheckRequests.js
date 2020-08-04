'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { sendCharacterCheckRequests } = require('../functions/actions/applications/applications')(config, firebase, db);

const main = async () => {
  return sendCharacterCheckRequests({
    items: ['LZxWU3IM2DsaMg7Hb1qS', 'SGlHaffdfKLmzXlLT9eq'],
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
