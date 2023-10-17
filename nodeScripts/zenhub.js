'use strict';

/**
 * Node script to test Zenhub GraphQL API
 * 
 * Run with: > npm run local:nodeScript zenHub.js
 */

const config = require('./shared/config');
const zenhub = require('../functions/shared/zenhub')(config);

const main = async () => {

  // @TODO: TEST CREATE ISSUE
  // return zenhub.createIssue({

  //   // @TODO: CHECK WHAT THE ENDPOINT EXPECTS!!

  // });

  return zenhub.getRepos();
};

main()
  .then((result) => {
    console.log(result);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
