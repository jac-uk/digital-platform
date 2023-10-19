'use strict';

/**
 * Node script to test Zenhub GraphQL API
 * 
 * Run with: > npm run local:nodeScript testZenHub.js
 */

const config = require('./shared/config');
const zenhub = require('../functions/shared/zenhub')(config);

const main = async () => {
  return zenhub.createZenhubIssue('BR0001', 'Test new issue body');
};

main()
  .then((newIssueID) => {
    console.log(`New issue ID: ${newIssueID}`);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
