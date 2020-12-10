const axios = require('axios');

module.exports = (config) => {

  return {
    post,
  };

  async function post(msgString) {
    const result = await axios.post(
      config.SLACK_URL,
      {
        text: msgString,
      }
    );
    return result;
  }

};
