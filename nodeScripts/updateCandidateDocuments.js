'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const search = require('../functions/actions/candidates/search')(firebase, db);

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
