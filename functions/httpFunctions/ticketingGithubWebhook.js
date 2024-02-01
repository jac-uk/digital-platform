const functions = require('firebase-functions');
const config = require('../shared/config.js');
const { firebase, db, auth } = require('../shared/admin.js');
const { getDocuments, getMissingNestedProperties, objectHasNestedProperty } = require('../shared/helpers.js');
const { checkArguments } = require('../shared/helpers.js');
const { checkFunctionEnabled } = require('../shared/serviceSettings.js')(db);
const { PERMISSIONS, hasPermissions } = require('../shared/permissions.js');
const { getUserByGithubUsername } = require('../actions/users')(auth, db);
const { getBugReportByRef } = require('../actions/bugReports')(db);
const { onAssignedIssue } = require('../actions/zenhub/hooks/onAssignedIssue')(config, db, auth);
const { onCreatedIssue } = require('../actions/zenhub/hooks/onCreatedIssue')(config, db, auth);

const { validateWebhookRequest } = require('../shared/zenhub')(config);

module.exports = functions.region('europe-west2').https.onRequest(async (req, res) => {

  // @TODO: NEED SECURITY IN HERE (SECRET PASSED IN HEADER) + could refactor it
  // see: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries#javascript-example

  console.log('ticketingGithubWebhook...');

  // if (config.GITHUB_WEBHOOK_SECRET === 'CHOKGE3vwbt2M53dQmtK84xZVS5xydeJ') {
  //   console.log('GITHUB_WEBHOOK_SECRET MATCH');
  // }
  // else {
  //   console.log('GITHUB_WEBHOOK_SECRET MISMATCH');
  // }




  if (!Object.prototype.hasOwnProperty.call(req.headers, 'x-hub-signature-256')) {
    const githubErrorMsg = 'x-hub-signature-256 header is missing from the github webhook request so cannot validate the request';
    console.log(githubErrorMsg);
    res.status(422).send(githubErrorMsg);
  }
  else if (!Object.prototype.hasOwnProperty.call(config, 'GITHUB_WEBHOOK_SECRET')) {
    console.log('GITHUB_WEBHOOK_SECRET has not been set for this env so cannot validate the request');
    res.status(422).send('Secret cannot be validated');
  }
  else {
    // Confrim that the request has a valid secret passed
    const valid = await validateWebhookRequest(config.GITHUB_WEBHOOK_SECRET, req.headers['x-hub-signature-256'], req.body);

    const supportedEventHooks = ['opened', 'assigned', 'unassigned'];
    const keys = Object.keys(req.body);
    if (!objectHasNestedProperty(req.body, 'action')) {
      const errorMsg = 'The request body is missing the action param';
      console.error(errorMsg);
      res.status(422).send(errorMsg);
    }
    else {
      const action = req.body.action;
      if (!Array.prototype.includes.call(supportedEventHooks, action)) {
        const warningMsg = `The action: ${action} is currently not supported`;
        console.log(warningMsg);
        res.status(200).send(warningMsg); 
      }
      else {
        if (action === 'opened') {
          const missingParams = getMissingNestedProperties(req.body, ['action', 'issue.url', 'issue.id', 'issue.title', 'issue.number']);
          if (missingParams.length > 0) {
            const errorMsg = `The request body is missing the following params: ${Array.prototype.join.call(missingParams, ',')}`;
            console.error(errorMsg);
            res.status(422).send(errorMsg);
          }
          else {

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
            }
            else {
              const referenceNumber = matchResult[0];
              const bugReport = await getBugReportByRef(referenceNumber);
              if (!bugReport) {
                const errorMsg = 'The bugReport for this issue could not be found';
                console.error(errorMsg);
                res.status(422).send(errorMsg);
              }
              else {
                onCreatedIssue(req.body, bugReport);
                res.status(200).send('Function executed successfully');
              }
            }
          }
        }
        else if (Array.prototype.includes.call(['assigned', 'unassigned'], action)) {
          // Check that the request is well formed
          const missingParams = getMissingNestedProperties(req.body, ['action', 'issue.url', 'issue.id', 'issue.title', 'issue.number', 'issue.assignees', 'assignee.login', 'assignee.id']);
          if (missingParams.length > 0) {
            const errorMsg = `The request body is missing the following params: ${Array.prototype.join.call(missingParams, ',')}`;
            console.error(errorMsg);
            res.status(422).send(errorMsg);
          }
          else {
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
            }
            else {
              const referenceNumber = matchResult[0];
              const bugReport = await getBugReportByRef(referenceNumber);
              if (!bugReport) {
                const errorMsg = 'The bugReport for this issue could not be found';
                console.error(errorMsg);
                res.status(422).send(errorMsg);
              }
              else {
                const user = await getUserByGithubUsername(assignee);
                if (!user) {
                  const errorMsg = 'The user for this assignee could not be found from their githubUsername';
                  console.error(errorMsg);
                  res.status(422).send(errorMsg);
                }
                else {
                  onAssignedIssue(req.body, bugReport, user);
                  // Your callable function logic here
                  res.status(200).send('Function executed successfully');
                }
              }

            }
          }
        }
        // ... other event hooks
      }
    }
  }
  
  return;
});

