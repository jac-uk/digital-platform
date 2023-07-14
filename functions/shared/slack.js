const axios = require('axios');
const { App, ExpressReceiver } = require('@slack/bolt');

module.exports = (config) => {
  const expressReceiver = new ExpressReceiver({
    signingSecret: config.SLACK_SIGNING_SECRET,
    endpoints: '/events',
    processBeforeResponse: true,
  });
  
  const app = new App({
    receiver: expressReceiver,
    token: config.SLACK_BOT_TOKEN,
    processBeforeResponse: true,
  });

  // Global error handler
  app.error(console.log);

  app.message('exercise', async ({ message, say }) => {
    // message object: https://api.slack.com/events/message
    try {
      console.log(JSON.stringify(message));
      // check if:
      // - message is not thread message to avoid sending multiple messages
      // - there is no link in the message
      if (!message.thread_ts && !message.text.includes('http')) {
        await say({
          text: `<@${message.user}> Please provide a link.`,
          thread_ts: message.ts,
        });
      }
    } catch (error) {
      console.error(error);
    }
  });
  
  return {
    expressReceiver,
    post,
  };

  async function post(msgString) {
    if (config.SLACK_URL) {
      const result = await axios.post(
        config.SLACK_URL,
        {
          text: msgString,
        }
      );
      return result;
    }
    return false;
  }

};
