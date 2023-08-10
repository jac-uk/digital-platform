'use strict';

/**
 * Node script to update the searchMap (_search) in all candidates
 * The search map is for:
 * exercise name, exercise referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncCandidatesSearchMap.js
 */

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
