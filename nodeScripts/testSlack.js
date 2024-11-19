'use strict';

import config from '../functions/shared/config.js';
import initSlack from '../functions/shared/slack.js';
const slack = initSlack(config);

const main = async () => {
  // TEST 1
  const result = await slack.post('OJ Test');
  console.log('RESULT:');
  console.log(result);
    
  // TEST 2
  // const referenceNumber = 'BR_ADMIN_DE_000242';
  // const bugReport = await getBugReportByRef(referenceNumber);

  // console.log('bugReport:');
  // console.log(bugReport);

  // await incrementSlackRetries(bugReport, 'create');
  //await updateBugReportOnSlackSent(bugReport, 'create');

  // TEST 3
  // const bugReports = await getBugReportsWithFailedSendOnCreate();
  // //console.log(bugReports);
  // for (const bugReport of bugReports) {
  //   console.log(`referenceNumber: ${bugReport.referenceNumber}`);
  // }

  // // TEST 4
  // // @TODO: Load createIssue.json into a variable and pass it into onCreatedIssue(params, bugReport, slackChannelId)
  // try {
  //   const slackChannelId = 'C0611PVFM1V';
  //   const referenceNumbers = ['BR_ADMIN_DE_000248'];
  //   for (const referenceNumber of referenceNumbers) {
  //     console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  //     console.log(`referenceNumber: ${referenceNumber}`);
  //     const bugReport = await getBugReportByRef(referenceNumber);
  //     //const result = await sendNewIssueSlackNotifications(bugReport, slackChannelId);
  //     const result = await sendNewIssueSlackNotifications(bugReport, slackChannelId);
  //     console.log('RESULT');
  //     console.log(result);
  //   }
  // }
  // catch (e) {
  //   console.log('ERROR');
  //   console.log(e);
  // }

  // TEST 5
  // try {
  //   const slackChannelId = 'C0611PVFM1V';
  //   await retrySlackMessageOnCreateIssue(slackChannelId);
  // }
  // catch (e) {
  //   console.log('ERROR');
  //   console.log(e);
  // }

  return true;
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
