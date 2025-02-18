import { onRequest } from 'firebase-functions/v2/https';
import { db, auth, firebase } from '../shared/admin.js';
import { getMissingNestedProperties, objectHasNestedProperty } from '../shared/helpers.js';
import initUsers from '../actions/users.js';
import initBugReports from '../actions/bugReports.js';
import initOnAssignedIssue from '../actions/zenhub/hooks/onAssignedIssue.js';
import initOnCreatedIssue from '../actions/zenhub/hooks/onCreatedIssue.js';
import initZenhub from '../shared/zenhub.js';
import { defineSecret } from 'firebase-functions/params';

const ZENHUB_GRAPH_QL_API_KEY = defineSecret('ZENHUB_GRAPH_QL_API_KEY');
const GITHUB_PAT = defineSecret('GITHUB_PAT');
const ZENHUB_ISSUES_WORKSPACE_ID = defineSecret('ZENHUB_ISSUES_WORKSPACE_ID');
const GITHUB_WEBHOOK_SECRET = defineSecret('GITHUB_WEBHOOK_SECRET');
const SLACK_TICKETING_APP_BOT_TOKEN = defineSecret('SLACK_TICKETING_APP_BOT_TOKEN');

const { getUserByGithubUsername } = initUsers(auth, db);
const { getBugReportByRef, getBugReportNumberFromIssueTitle } = initBugReports(db, firebase);
const { onCreatedIssue } = initOnCreatedIssue(db, firebase);

export default onRequest(
  {
    region: 'europe-west2',
    memory: '256MB',
    timeoutSeconds: 240,
    minInstances: 0,
    maxInstances: 10,
    secrets: [
      GITHUB_WEBHOOK_SECRET,
      ZENHUB_GRAPH_QL_API_KEY,
      GITHUB_PAT,
      ZENHUB_ISSUES_WORKSPACE_ID,
      SLACK_TICKETING_APP_BOT_TOKEN,
    ],  // ✅ Ensure the function has access to the secrets
  },
  async (req, res) => {
    //res.json({ message: 'Hello from Gen 2 HTTP Function!' });

    // Ensure config var is set for communicating with slack
    if (!process.env.SLACK_TICKETING_APP_BOT_TOKEN) {
      console.error('The config is missing a SLACK_TICKETING_APP_BOT_TOKEN');
      res.status(422).send('The application isnt configured correctly');
      return;
    }

    // Ensure config var is set for communicating with slack
    if (!process.env.SLACK_TICKETING_APP_CHANNEL_ID) {
      console.error('The config is missing a SLACK_TICKETING_APP_CHANNEL_ID');
      res.status(422).send('The application isnt configured correctly');
      return;
    }

    // VALIDATE THE REQUEST

    if (!Object.prototype.hasOwnProperty.call(req.headers, 'x-hub-signature-256')) {
      const githubErrorMsg = 'x-hub-signature-256 header is missing from the github webhook request so cannot validate the request';
      console.error(githubErrorMsg);
      res.status(422).send(githubErrorMsg);
      return;
    }
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      console.error('GITHUB_WEBHOOK_SECRET has not been set for this env so cannot validate the request');
      res.status(422).send('Secret cannot be validated');
      return;
    }

    const { validateWebhookRequest } = initZenhub(
      process.env.ZENHUB_GRAPH_QL_URL,
      process.env.ZENHUB_GRAPH_QL_API_KEY,
      process.env.GITHUB_PAT,
      process.env.ZENHUB_ISSUES_WORKSPACE_ID
    );

    // Confirm that the request has a valid secret passed
    await validateWebhookRequest(process.env.GITHUB_WEBHOOK_SECRET, req.headers['x-hub-signature-256'], req.body);
    // Check action param exists in the body
    //const keys = Object.keys(req.body);
    if (!objectHasNestedProperty(req.body, 'action')) {
      const errorMsg = 'The request body is missing the action param';
      console.error(errorMsg);
      res.status(422).send(errorMsg);
      return;
    }
    // Check its a supported action
    const action = req.body.action;
    const supportedEventHooks = ['opened', 'assigned', 'unassigned'];
    if (!Array.prototype.includes.call(supportedEventHooks, action)) {
      const warningMsg = `The action: ${action} is currently not supported`;
      console.log(warningMsg);
      res.status(200).send(warningMsg);
      return;
    }

    // PROCESS ACTIONS

    // OPENED ACTION
    if (action === 'opened') {
      const missingParams = getMissingNestedProperties(req.body, ['action', 'issue.url', 'issue.id', 'issue.title', 'issue.number']);
      if (missingParams.length > 0) {
        const errorMsg = `The request body is missing the following params: ${Array.prototype.join.call(missingParams, ',')}`;
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      // Check that the bugReport referenceNumber can be extracted from the request params
      const issueTitle = req.body.issue.title;
      // Extract the bugReport referenceNUmber from the github issue title
      const referenceNumber = getBugReportNumberFromIssueTitle(issueTitle);
      if (!referenceNumber) {
        const errorMsg = 'The github issue title is missing the bugReport reference number which begins with BR_ followed by 6 digits';
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      let bugReport = await getBugReportByRef(referenceNumber);
      if (!bugReport) {
        const errorMsg = 'The bugReport for this issue could not be found';
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      await onCreatedIssue(bugReport, req.body.issue.number, req.body.issue.html_url);
      res.status(200).send('Function executed successfully');
    }
    // ASSIGNED/UNASSIGNED ACTIONS
    else if (Array.prototype.includes.call(['assigned', 'unassigned'], action)) {
      // Check that the request is well formed
      const missingParams = getMissingNestedProperties(req.body, ['action', 'issue.url', 'issue.id', 'issue.title', 'issue.number', 'issue.assignees', 'assignee.login', 'assignee.id']);
      if (missingParams.length > 0) {
        const errorMsg = `The request body is missing the following params: ${Array.prototype.join.call(missingParams, ',')}`;
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      const assignee = req.body.assignee.login;
      // Check that the bugReport referenceNumber can be extracted from the request params
      const issueTitle = req.body.issue.title;
      // Extract the bugReport referenceNUmber from the github issue title
      const referenceNumber = getBugReportNumberFromIssueTitle(issueTitle);
      if (!referenceNumber) {
        const errorMsg = 'The github issue title is missing the bugReport reference number which begins with BR_ followed by 6 digits';
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      const bugReport = await getBugReportByRef(referenceNumber);
      if (!bugReport) {
        const errorMsg = 'The bugReport for this issue could not be found';
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }
      const user = await getUserByGithubUsername(assignee);
      if (!user) {
        const errorMsg = 'The user for this assignee could not be found from their githubUsername';
        console.error(errorMsg);
        res.status(422).send(errorMsg);
        return;
      }

      const { onAssignedIssue } = initOnAssignedIssue(process.env.SLACK_TICKETING_APP_BOT_TOKEN, db, auth);

      await onAssignedIssue(req.body, bugReport, user, process.env.SLACK_TICKETING_APP_CHANNEL_ID);
      // Your callable function logic here
      res.status(200).send('Function executed successfully');
    }
    // ... other event hooks

    return;
  }
);

