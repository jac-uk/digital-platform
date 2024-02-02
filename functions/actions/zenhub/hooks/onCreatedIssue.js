module.exports = (config, db, auth) => {

  const slack = require('../../../shared/slack')(config);
  const { getUser } = require('../../users')(auth, db);

  return {
    onCreatedIssue,
  };

  /**
   * Hook called when an issue is created in github
   * Send a message to a Slack channel notifying the team of the bug
   * 
   * @param {object} params 
   * @param {object} bugReport
   * @param {string} slackChannelId
   */
  async function onCreatedIssue(params, bugReport, slackChannelId) {

    // @TODO: May be worth putting the reporter and userId fields into one object inside the bugReport collection record!?
    const reporterUser = await getUser(bugReport.userId);

    const issue = {
      action: params.action,
      url: params.issue.html_url,
      id: params.issue.id,
      number: params.issue.number,
      title: params.issue.title,
    };

    // Build the slack message
    const blocksArr = [];
    blocksArr.push(addSlackDivider());
    blocksArr.push(addSlackSection1(issue, bugReport, reporterUser));
    blocksArr.push(addSlackSection2(bugReport));
    if (bugReport.candidate) {
      blocksArr.push(addSlackSection3(bugReport));
    }

    // Send Slack msg
    slack.postBotBlocksMsgToChannel(slackChannelId, blocksArr);
  }

  function addSlackDivider() {
    return {
			'type': 'divider',
		};
  }
  
  function addSlackSection1(issue, data, user) {
    let text = `The following *${data.criticality}* issue <${issue.url}|#${issue.number}> was raised by <@${user.slackMemberId}>`;
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
