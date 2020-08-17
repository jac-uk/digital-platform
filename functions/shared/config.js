const functions = require('firebase-functions');

module.exports = {
  ASSESSMENTS_URL: functions.config().assessments.url,
  ASSESSMENT_TYPE: {
    COMPETENCY: 'competency',
    SKILLS: 'skills',
    GENERAL: 'general',
  },
  QUALIFYINGTESTRESPONSES_STATUS: {
    CREATED: 'created',
    STARTED: 'started',
    COMPLETED: 'completed',
  },
  NOTIFY_KEY: functions.config().notify.key,
  SLACK_URL: functions.config().slack.url,
};
