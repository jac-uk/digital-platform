const functions = require('firebase-functions');

module.exports = {
  APPLY_URL: functions.config().apply.url,
  ASSESSMENTS_URL: functions.config().assessments.url,
  ASSESSMENT_TYPE: {
    COMPETENCY: 'competency',
    SKILLS: 'skills',
    GENERAL: 'general',
  },
  QUALIFYINGTESTRESPONSES_STATUS: {
    CREATED: 'created',
    ACTIVATED: 'activated',
    STARTED: 'started',
    COMPLETED: 'completed',
  },
  NOTIFY_KEY: functions.config().notify.key,
  SLACK_URL: functions.config().slack.url,
};
