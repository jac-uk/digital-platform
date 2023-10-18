'use strict';

/**
 * Node script to test Zenhub GraphQL API
 * 
 * Run with: > npm run local:nodeScript testZenHub.js
 */

const config = require('./shared/config');
const zenhub = require('../functions/shared/zenhub')(config);

const main = async () => {
  return zenhub.createIssue('Test new issue body');
};

main()
  .then((result) => {
    //console.log(result);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
