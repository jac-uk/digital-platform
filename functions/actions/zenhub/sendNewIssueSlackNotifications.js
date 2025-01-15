import initSlack from '../../shared/slack.js';
import initUsers from '../users.js';
import initBugReports from '../bugReports.js';
import get from 'lodash/get.js';

export default (config, db, auth, firebase) => {

  const slack = initSlack(config);
  const { getUser } = initUsers(auth, db);
  const { incrementSlackRetries, updateBugReportOnSlackSent } = initBugReports(db, firebase);

  return {
    sendNewIssueSlackNotifications,
  };

  /**
   * Called for new issues (or those previously created whose slack messages weren't sent out)
   * Send a message to a Slack channel notifying the team of the bug
   * Increment retries then send a slack message and only if successful set the timestamp
   * 
   * @param {object} params 
   * @param {object} bugReport
   * @param {string} slackChannelId
   */
  async function sendNewIssueSlackNotifications(bugReport, slackChannelId) {
    const reporterUser = await getUser(bugReport.userId);

    // Build the slack message
    const blocksArr = [];
    blocksArr.push(addSlackDivider());
    blocksArr.push(addSlackSection1(bugReport, reporterUser));
    blocksArr.push(addSlackSection2(bugReport));
    if (bugReport.candidate) {
      blocksArr.push(addSlackSection3(bugReport));
    }

    // Increment bugReport retries
    await incrementSlackRetries(bugReport, 'create');

    // Send Slack msg
    const slackResponse = await slack.postBotBlocksMsgToChannel(slackChannelId, blocksArr);
    if (slackResponse && Object.prototype.hasOwnProperty.call(slackResponse, 'ok') && slackResponse.ok === true) {

      // Update the slack timestamp for the 'create' action
      await updateBugReportOnSlackSent(bugReport, 'create');
      return true;
    }
    else {
      console.log(`Slack request failed for bugReport: ${bugReport.referenceNumber}`);
      return false;
    }
  }

  function addSlackDivider() {
    return {
			'type': 'divider',
		};
  }
  
  //function addSlackSection1(data, user, issue = null) {
  function addSlackSection1(data, user) {
    let text = '';

    const githubIssueUrl = get(data, 'githubIssueUrl', null);
    const zenhubIssueNumber = get(data, 'zenhubIssueNumber', null);

    if (githubIssueUrl && zenhubIssueNumber) {
      text += `The following *${data.criticality}* issue <${githubIssueUrl}|#${zenhubIssueNumber}> was raised by <@${user.slackMemberId}>`;
    }
    else {
      text += `An issue was raised by <@${user.slackMemberId}> but we are unable to include the ticket number`;
    }
    if (data.exercise.referenceNumber) {
      text += ` for exercise: *${data.exercise.referenceNumber}*`;
    }
    else if (data.application.referenceNumber) {
      text += ` for application: *${data.application.referenceNumber}*`;
    }
    return {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': text,
      },
    };
  }

  function addSlackSection2(data) {
    return {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': `Description: ${data.issue}`,
      },
    };
  }
  
  function addSlackSection3(data) {
    let fields = [];
    // fields.push(      {
    //   'type': 'mrkdwn',
    //   'text': `*Bug Reference Number:*\n${data.referenceNumber}`,
    // });
    //if (data.candidate) {
    fields.push({
      'type': 'mrkdwn',
      'text': `*Candidate:*\n${data.candidate}`,
    });
    fields.push({
      'type': 'mrkdwn',
      'text': `*CPS Device:*\n${data.cpsDevice === '1' ? 'true' : 'false'}`,
    });
    //}
    // fields.push(      {
    //   'type': 'mrkdwn',
    //   'text': `*Link to page:*\n<${data.url}>`,
    // });
    return {
      'type': 'section',
      'fields': fields,
    };
  }
};
