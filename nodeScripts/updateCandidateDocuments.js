'use strict';

const { app, db } = require('./shared/admin.js');
const search = require('../functions/actions/candidates/search')(db);

const main = async () => {
  // return search.updateCandidate('05eaMEUNA0NfA6uhhd4kxYzU2of2');
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
