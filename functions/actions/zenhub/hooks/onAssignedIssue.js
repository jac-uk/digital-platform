import initSlack from '../../../shared/slack.js';
import initUsers from '../../users.js';

export default (config, db, auth) => {

  const slack = initSlack(config);
  const { getUser } = initUsers(auth, db);

  return {
    onAssignedIssue,
  };

  /**
   * Hook called when an issue is assigned/unassigned in github
   * assigneeUser is the user who has been assigned/unassigned retrieved from our db by their githubUsername
   * @param {object} params 
   * @param {object} bugReport 
   * @param {object} assigneeUser
   * @param {string} slackChannelId
   */
  async function onAssignedIssue(params, bugReport, assigneeUser, slackChannelId) {
    // @TODO: May be worth putting the reporter and userId fields into one object inside the bugReport collection record!?
    const reporterUser = await getUser(bugReport.userId);

    const issue = {
      action: params.action,
      url: params.issue.html_url,
      id: params.issue.id,
      number: params.issue.number,
      title: params.issue.title,
    };

    const assigneesOrig = params.issue.assignees;

    // Use the map function to transform the array
    const assignees = assigneesOrig.map(({ id, login, type }) => ({ id, login, type }));

    // Assignee who has been ASSIGNED OR UNASSIGNED!
    const assignee = {
      login: params.assignee.login,
      id: params.assignee.id,
    };

    // Update the bugReport
    const bugReportId = bugReport.id; // Get the ID of the document

    // Update the record
    await db.collection('bugReports').doc(bugReportId).update({
      githubAssignees: assignees,
    });

    // Build Slack msg using markdown
    const blocksArr = [];
    blocksArr.push(addSlackDivider());
    blocksArr.push(addSlackSection(issue, bugReport, assigneeUser, reporterUser));

    // Send Slack msg
    await slack.postBotBlocksMsgToChannel(slackChannelId, blocksArr);
  }

  function addSlackDivider() {
    return {
			'type': 'divider',
		};
  }

  function addSlackSection(issue, data, assigneeUser, reporterUser) {
    const assignText = issue.action === 'assigned' ? 'has been assigned to' : 'has been unassigned from';
    let text = `The following *${data.criticality}* issue <${issue.url}|#${issue.number}> raised by <@${reporterUser.slackMemberId}> ${assignText} <@${assigneeUser.slackMemberId}>`;
    return {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': text,
      },
    };
  }

};
