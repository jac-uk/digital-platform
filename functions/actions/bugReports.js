const config = require('../shared/config');

module.exports = (config, firebase, db) => {

  const zenhub = require('../shared/zenhub')(config);
  const slack = require('../shared/slack')(config);

  return {
    onBugReportCreated,
  };

  /**
   * Create an issue in Zenhub
   * Send a message to a Slack channel notifying the team of the bug
   * Update the bugReport collection with the Zenhub Issue ID
   * @param {*} bugReportId 
   * @param {*} data 
   */
  async function onBugReportCreated(bugReportId, data) {

    // Build Zenhub message
    const body = buildZenhubPayload(data);

    // Create issue in Zenhub
    const zenhubIssueId = await zenhub.createZenhubIssue(data.referenceNumber, body);

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
    blocksArr.push(addSlackSection1(data));
    blocksArr.push(addSlackSection2(data));
    blocksArr.push(addSlackSection3(data));
    blocksArr.push(addSlackSection4(zenhubIssueId));
    const blocks = {
      'blocks': blocksArr,
    };

    // Send Slack msg
    slack.postBlocks(blocks);
  }

  function buildZenhubPayload(data) {
    let payload = `The following ${data.criticality} issue was raised by ${data.reporter}`;
    if (data.exercise.referenceNumber) {
      payload += ` for exercise ${data.exercise.referenceNumber}`;
    }
    payload += `.\nDescription: ${data.issue}`;
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

};