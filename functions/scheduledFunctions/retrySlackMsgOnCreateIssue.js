import config from '../shared/config.js';
import * as functions from 'firebase-functions/v1';
import { auth, firebase, db } from '../shared/admin.js';
import initSlackActions from '../actions/slack.js';
const { retrySlackMessageOnCreateIssue } = initSlackActions(auth, config, db, firebase);
const SCHEDULE = config.SLACK_RETRY_SCHEDULE ? config.SLACK_RETRY_SCHEDULE : 'every 2 minutes';

export default functions
  .region('europe-west2')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone('Europe/London')
  .onRun(async () => {
    if (Object.prototype.hasOwnProperty.call(config, 'SLACK_TICKETING_APP_CHANNEL_ID')) {
      const result = await retrySlackMessageOnCreateIssue(config.SLACK_TICKETING_APP_CHANNEL_ID);
      return result;
    }
    console.log('Cannot run scheduled task: retrySlackMessageOnCreateIssue due to missing SLACK_TICKETING_APP_CHANNEL_ID');
    return false;
  });
