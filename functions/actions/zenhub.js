const config = require('../shared/config');

module.exports = (config, firebase, db, auth) => {

  const zenhub = require('../shared/zenhub')(config);
  const slack = require('../shared/slack')(config);
  const { getDocument, objectHasNestedProperty } = require('../shared/helpers');

  return {
    createZenhubIssue,
    processAssignedIssueHook,
  };

  /**
   * Create an issue in Zenhub
   * Send a message to a Slack channel notifying the team of the bug
   * Update the bugReport collection with the Zenhub Issue ID
   * 
   * @param {*} bugReportId 
   */
  async function createZenhubIssue(bugReportId, userId) {
    const user = await getDocument(db.collection('users').doc(userId));
    const bugReport = await getDocument(db.collection('bugReports').doc(bugReportId));

    // Build Zenhub message
    const body = buildZenhubPayload(bugReport, user);

    const label = bugReport.candidate ? 'Apply' : 'Admin';

    // Create issue in Zenhub
    //const zenhubIssueId = await zenhub.createZenhubIssue(bugReport.referenceNumber, body);
    const zenhubIssueId = await zenhub.createGithubIssue(bugReport.referenceNumber, body, label);

    // Update bugReport with Zenhub issue ID in firestore
    if (zenhubIssueId) {
      await db.doc(`bugReports/${bugReportId}`).update({
        zenhubIssueId: zenhubIssueId,
        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Build Slack msg using markdown
    const blocksArr = [];
    blocksArr.push(addSlackDivider());
    blocksArr.push(addSlackSection1(bugReport));
    blocksArr.push(addSlackSection2(bugReport));
    blocksArr.push(addSlackSection3(bugReport));
    blocksArr.push(addSlackSection4(zenhubIssueId));
    const blocks = {
      'blocks': blocksArr,
    };

    // Send Slack msg
    slack.postBlocks(blocks);
  }

  function buildZenhubPayload(data, user) {
    let payload = `The following ${data.criticality} issue was raised by ${data.reporter}`;
    if (data.exercise.referenceNumber) {
      payload += ` for exercise ${data.exercise.referenceNumber}`;
    }
    if (data.exercise.candidate) {
      payload += `\nCandidate: ${data.exercise.candidate}`;
    }
    payload += `.\nCriticality: ${data.criticality}`;
    payload += `.\nDescription: ${data.issue}`;
    payload += `.\nExpectation: ${data.expectation}`;
    payload += `.\nBrowser: ${data.browser}`;
    payload += `.\nOS: ${data.os}`;
    payload += `.\nContact Details: ${data.contactDetails}`;
    payload += `.\nUrl: ${data.url}`;
    payload += `.\nCPS Device? ${data.cpsDevice === '0' ? 'No' : 'Yes'}`;
    if (data.screenshot) {
      payload += `.\nScreenshot Link: ${data.screenshot.downloadUrl}`;
      payload += '.\nScreenshot:';
      //payload += '.\n<img src=\'https://imageio.forbes.com/specials-images/imageserve/5d35eacaf1176b0008974b54/2020-Chevrolet-Corvette-Stingray/0x0.jpg?format=jpg&crop=4560,2565,x790,y784,safe&width=1440\' />';

      // Note:The image src below does not work when using localhost
      payload += `.\n<img src='${data.screenshot.downloadUrl}' />`;
    }
    //payload += '.\n<!-- test = { id: 23, name: \'tester\' } -->';
    //payload += `.\n<!-- reporter = { email: '${data.contactDetails}' } -->`;
    payload += `.\n<!-- { reporter: '${user.slackMemberId}', developer: 'U052NR5U43Z' } -->`;
   
    return payload;
  }

  function addSlackDivider() {
    return {
			'type': 'divider',
		};
  }

  function addSlackSection1(data) {
    let text = `The following *${data.criticality}* issue was raised by *${data.reporter}*`;
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
    fields.push(      {
      'type': 'mrkdwn',
      'text': `*Bug Reference Number:*\n${data.referenceNumber}`,
    });
    if (data.candidate) {
      fields.push({
        'type': 'mrkdwn',
        'text': `*Candidate:*\n${data.candidate}`,
      });
      fields.push({
        'type': 'mrkdwn',
        'text': `*CPS Device:*\n${data.cpsDevice === '1' ? 'true' : 'false'}`,
      });
    }
    fields.push(      {
      'type': 'mrkdwn',
      'text': `*Link to page:*\n<${data.url}>`,
    });
    return {
      'type': 'section',
      'fields': fields,
    };
  }

  function addSlackSection4(zenhubIssueId) {
    if (zenhubIssueId) {
      return {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `Zenhub Issue ID: ${zenhubIssueId}`,
        },
      };
    }
    else {
      return {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*However there was an error when trying to send it to Zenhub. Please see the digital platform console*',
        },
      };
    }
  }




  // @TODO: ALL THE CODE BELOW SHOUDL GO INTO ITS OWN FILE AND THIS FILE WILL NEED RENAMING THEN CAN UPDATE THE FN NAMES FOR THE SLACK STUFF BELOW HERE!
  /**
   * assigneeUser is the user who has been assigned/unassigned retrieved from our db by their githubUsername
   * @param {*} params 
   * @param {*} bugReport 
   * @param {*} assigneeUser 
   */
  async function processAssignedIssueHook(params, bugReport, assigneeUser) {
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

    console.log(`bugReportId: ${bugReportId}`);

    // Update the record
    await db.collection('bugReports').doc(bugReportId).update({
      githubAssignees: assignees,
    });

    // Build Slack msg using markdown
    const blocksArr = [];
    blocksArr.push(addSlackDivider());
    blocksArr.push(addSlackSection1P(issue, bugReport, assigneeUser));

    const blocks = {
      'blocks': blocksArr,
    };

    // Send Slack msg
    slack.postBlocks(blocks);
  }

  // @TODO: RENAME FUNCTION ONCE MOVED TO DEDICATED MODULE
  function addSlackSection1P(issue, data, user) {

    console.log(`Slack member id is: ${user.slackMemberId}`);

    const assignText = issue.action === 'assigned' ? 'has been assigned to' : 'has been unassigned from';
    let text = `The following *${data.criticality}* issue <${issue.url}|#${issue.number}> raised by *${data.reporter}* ${assignText} <@${user.slackMemberId}>`;
    return {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': text,
      },
    };
  }

};
