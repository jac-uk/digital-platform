'use strict';

const config = require('./shared/config');
const { app, db } = require('./shared/admin.js');
const { customSearch } = require('../functions/actions/applications')(config, db);

const main = async () => {
  return customSearch();
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
