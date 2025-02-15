import axios from 'axios';

export default (slackBotToken) => {

  return {
    post,
    postBlocks,
    postBotMsgToChannel,
    postBotBlocksMsgToChannel,
  };

  async function post(msgString) {
    if (process.env.SLACK_URL) {
      const result = await axios.post(
        process.env.SLACK_URL,
        {
          text: msgString,
        }
      );
      return result;
    }
    return false;
  }

  async function postBlocks(blocks) {
    if (process.env.SLACK_URL) {

      const result = await axios.post(
        process.env.SLACK_URL,
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
    if (slackBotToken) {
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
   * @returns 
   */
  async function postBotBlocksMsgToChannel(channelId, blocks) {
    if (slackBotToken) {
      const postData = {
        channel: channelId,
        blocks: blocks,
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

};
