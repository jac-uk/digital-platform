import axios from 'axios';

export default (config) => {
  return verifyRecaptcha;

  /**
   * Verify recaptcha token
   */
  async function verifyRecaptcha({ token, remoteip }) {
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
