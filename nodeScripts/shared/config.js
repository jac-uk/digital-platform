module.exports = {
  ASSESSMENTS_URL: process.env.ASSESSMENTS_URL,
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
  NOTIFY_KEY: process.env.NOTIFY_LIMITED_KEY,
  SLACK_URL: process.env.SLACK_URL,
};
