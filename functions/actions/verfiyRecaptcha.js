const axios = require('axios');

module.exports = (config) => {
  return verfiyRecaptcha;

  /**
   * Verify recaptcha token
   */
  async function verfiyRecaptcha({ token, remoteip }) {
    try {
      const res = await axios.post(config.GOOGLE_RECAPTCHA_VALIDATION_URL, null, {
        params: {
          secret: config.GOOGLE_RECAPTCHA_SECRET,
          response: token,
          remoteip,
        },
      });
      return res.data;
    } catch (error) {
      return error;
    }
  }
};
