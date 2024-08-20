'use strict';

/**
 * Node script to test Zenhub GraphQL API
 * 
 * Run with: > npm run local:nodeScript testZenHub.js
 */

import config from './shared/config.js';
import initZenhub from '../functions/shared/zenhub.js';

const zenhub = initZenhub(config);

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
