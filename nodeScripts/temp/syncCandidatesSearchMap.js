'use strict';

const { firebase, app, db } = require('../shared/admin.js');
const search = require('../../functions/actions/candidates/search')(firebase, db);

const main = async () => {
  return search.updateAllCandidates();
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
