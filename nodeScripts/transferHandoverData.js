'use strict';

const { app } = require('./shared/admin.js');
const { firebase, db } = require('./shared/admin.js');
const config = require('./shared/config');
const transferHandoverData = require('../functions/actions/exercises/transferHandoverData')(config, firebase, db);

const main = async () => {
  return transferHandoverData({exerciseId: 'ws8DOmg9UkBA2KrHnWdl'});
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
