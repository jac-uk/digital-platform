'use strict';

/**
 * Node script to test Zenhub GraphQL API
 * 
 * Run with: > npm run local:nodeScript testZenHub.js
 */

import { app } from './shared/admin.js';
import initZenhub from '../functions/shared/zenhub.js';
import { defineSecret } from 'firebase-functions/params';

const ZENHUB_GRAPH_QL_API_KEY = defineSecret('ZENHUB_GRAPH_QL_API_KEY');
const GITHUB_PAT = defineSecret('GITHUB_PAT');
const ZENHUB_ISSUES_WORKSPACE_ID = defineSecret('ZENHUB_ISSUES_WORKSPACE_ID');
const ZENHUB_GRAPH_QL_URL = process.env.ZENHUB_GRAPH_QL_URL;

const zenhub = initZenhub(ZENHUB_GRAPH_QL_URL, ZENHUB_GRAPH_QL_API_KEY, GITHUB_PAT, ZENHUB_ISSUES_WORKSPACE_ID);

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
