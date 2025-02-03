import axios from 'axios';

export default (config) => {

  return {
    post,
    postBlocks,
    postBotMsgToChannel,
    postBotBlocksMsgToChannel,
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

  async function postBlocks(blocks) {
    if (config.SLACK_URL) {

      const result = await axios.post(
        config.SLACK_URL,
        blocks
      );
      return result;
    }
    return false;
  }

  /**
   * Post message to a channel using the Slack Bot and Slack API
   * @param {string} channelId 
   * @param {string} msg 
   * @returns 
   */
  async function postBotMsgToChannel(channelId, msg) {
    if (config.SLACK_TICKETING_APP_BOT_TOKEN) {
      const slackBotToken = config.SLACK_TICKETING_APP_BOT_TOKEN;      
      const postData = {
        channel: channelId,
        text: msg,
      };
      const msgConfig = {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${slackBotToken}`,
        },
      };
      try {
        const response = await axios.post('https://slack.com/api/chat.postMessage', postData, msgConfig);
        return response.data;
      }
      catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
      }
    }
    return false;
  }

  /**
   * Post blocks message to a channel using the Slack Bot and Slack API
   * @param {string} channelId 
   * @param {array} blocks
   * @param {string} ts
   * @returns 
   */
  async function postBotBlocksMsgToChannel(channelId, blocks, ts = null) {
    if (config.SLACK_TICKETING_APP_BOT_TOKEN) {
      const slackBotToken = config.SLACK_TICKETING_APP_BOT_TOKEN;      
      const postData = {
        channel: channelId,
        blocks: blocks,
      };
      if (ts) {
        postData.thread_ts = ts;
      }
      const msgConfig = {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${slackBotToken}`,
        },
      };
      try {
        const response = await axios.post('https://slack.com/api/chat.postMessage', postData, msgConfig);
        return response.data;
      }
      catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
      }
    }
    return false;
  }

};
