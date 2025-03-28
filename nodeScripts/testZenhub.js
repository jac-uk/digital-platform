'use strict';

/**
 * Node script to test Zenhub GraphQL API
 *
 * Run with: > npm run local:nodeScript testZenHub.js
 */

import { app } from './shared/admin.js';
import initZenhub from '../functions/shared/zenhub.js';

const zenhub = initZenhub();

const main = async () => {
  try {
    const newIssueID = await zenhub.createZenhubIssue('TESTER2', '"Test" new issue body');
    console.log(`newIssueID: ${newIssueID}`);
    return true;
  }
  catch (e) {
    console.log('ERROR:');
    console.log(e);
    return false;
  }


};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
