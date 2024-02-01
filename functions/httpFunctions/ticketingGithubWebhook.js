const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { db, auth } = require('../shared/admin.js');
const { getMissingNestedProperties, objectHasNestedProperty } = require('../shared/helpers.js');
const { getUserByGithubUsername } = require('../actions/users')(auth, db);
const { getBugReportByRef } = require('../actions/bugReports')(db);
const { onAssignedIssue } = require('../actions/zenhub/hooks/onAssignedIssue')(config, db, auth);
const { onCreatedIssue } = require('../actions/zenhub/hooks/onCreatedIssue')(config, db, auth);

const { validateWebhookRequest } = require('../shared/zenhub')(config);

module.exports = functions.region('europe-west2').https.onRequest(async (req, res) => {

  // VALIDATE THE REQUEST

  if (!Object.prototype.hasOwnProperty.call(req.headers, 'x-hub-signature-256')) {
    const githubErrorMsg = 'x-hub-signature-256 header is missing from the github webhook request so cannot validate the request';
    console.log(githubErrorMsg);
    res.status(422).send(githubErrorMsg);
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(config, 'GITHUB_WEBHOOK_SECRET')) {
    console.log('GITHUB_WEBHOOK_SECRET has not been set for this env so cannot validate the request');
    res.status(422).send('Secret cannot be validated');
    return;
  }
  // Confirm that the request has a valid secret passed
  const valid = await validateWebhookRequest(config.GITHUB_WEBHOOK_SECRET, req.headers['x-hub-signature-256'], req.body);
  // Check action param exists in the body
  const keys = Object.keys(req.body);
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
    // The test method check if the string contains the pattern 'BR_' followed by 6 digits
    const regex = /BR_\d{6}/;

    // Use the match method to extract the matching string
    const matchResult = issueTitle.match(regex);

    if (!matchResult) {
      const errorMsg = 'The github issue title is missing the bugReport reference number which begins with BR_ followed by 6 digits';
      console.error(errorMsg);
      res.status(422).send(errorMsg);
      return;
    }
    const referenceNumber = matchResult[0];
    const bugReport = await getBugReportByRef(referenceNumber);
    if (!bugReport) {
      const errorMsg = 'The bugReport for this issue could not be found';
      console.error(errorMsg);
      res.status(422).send(errorMsg);
      return;
    }
    onCreatedIssue(req.body, bugReport);
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
    // The test method check if the string contains the pattern 'BR_' followed by 6 digits
    const regex = /BR_\d{6}/;
    // Use the match method to extract the matching string
    const matchResult = issueTitle.match(regex);
    if (!matchResult) {
      const errorMsg = 'The github issue title is missing the bugReport reference number which begins with BR_ followed by 6 digits';
      console.error(errorMsg);
      res.status(422).send(errorMsg);
      return;
    }
    const referenceNumber = matchResult[0];
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
    onAssignedIssue(req.body, bugReport, user);
    // Your callable function logic here
    res.status(200).send('Function executed successfully');
  }
  // ... other event hooks
  
  return;
});

