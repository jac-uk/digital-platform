'use strict';
import { auth, firebase, db }  from './shared/admin.js';
import initSlackActions from '../functions/actions/slack.js';
import dotenv from 'dotenv';

dotenv.config(); // Load .env for local use


const main = async () => {
  const { retrySlackMessageOnCreateIssue } = initSlackActions(auth, db, firebase);
  const channelId = '';

  const result = await retrySlackMessageOnCreateIssue(channelId);
  return result;
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
