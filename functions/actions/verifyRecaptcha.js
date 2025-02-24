import axios from 'axios';

export default () => {
  return verifyRecaptcha;

  /**
   * Verify recaptcha token
   *
   * Note: relies on the following environment values
   *  GOOGLE_RECAPTCHA_VALIDATION_URL
   *  GOOGLE_RECAPTCHA_SECRET
   */
  async function verifyRecaptcha({ token, remoteip }) {
    // check for required env values
    if (!process.env.GOOGLE_RECAPTCHA_VALIDATION_URL) return false;
    if (!process.env.GOOGLE_RECAPTCHA_SECRET) return false;

    try {
      const res = await axios.post(process.env.GOOGLE_RECAPTCHA_VALIDATION_URL, null, {
        params: {
          secret: process.env.GOOGLE_RECAPTCHA_SECRET,
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
