import axios from 'axios';

export default (secret, validationUrl) => {
  return verifyRecaptcha;

  /**
   * Verify recaptcha token
   */
  async function verifyRecaptcha({ token, remoteip }) {
    try {
      const res = await axios.post(validationUrl, null, {
        params: {
          secret: secret,
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
