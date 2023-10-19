const axios = require('axios');

module.exports = (config) => {

  return {
    post,
    postBlocks,
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
};
