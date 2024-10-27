import initFactories from '../../shared/factories.js';
import initNotify from '../../shared/notify.js';
import { getDocument, applyUpdates } from '../../shared/helpers.js';

export default (config, firebase, db) => {

  const { newSmsNotificationLoginVerificationNumber } = initFactories(config);
  const { sendSMS } = initNotify(config);

  return {
    sendSmsCode,
    verifySmsCode,
  };

  /**
   * Send SMS verification code
   * 
   * @param {string} uid    User ID
   * @param {string} mobile UK or international number (e.g. +447900900123)
   */
  async function sendSmsCode({ uid, mobile }) {
    // 1. Generate verification code and expiry time
    const code = generateVerificationCode(6);
    const expiredAt = firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));

    // 2. Save verification code to database
    const commands = [];
    commands.push({
      command: 'update',
      ref: db.collection('candidates').doc(uid),
      data: {
        verification: { code, expiredAt, mobile } },
    });
    await applyUpdates(db, commands);

    // 3. Send verification code to candidate
    const notification = newSmsNotificationLoginVerificationNumber(firebase, mobile, code);
    await sendSMS(notification.mobile, notification.template.id, notification.personalisation);

    return true;
  }

  /**
   * Verify SMS verification code
   * 
   * @param {string} uid  User ID
   * @param {string} code Verification code
   */
  async function verifySmsCode({ uid, code }) {
    // 1. Check if verification code is valid and not expired
    const candidate = await getDocument(db.collection('candidates').doc(uid));
    if (!candidate || !candidate.verification || candidate.verification.code.toString() !== code) {
      console.log('Invalid verification code');
      return false;
    }

    // 2. Update candidate's verification status
    const commands = [];
    commands.push({
      command: 'update',
      ref: candidate.ref,
      data: {
        verification: {
          code: null,
          expiredAt: null,
          mobile: null,
        },
      },
    });

    await applyUpdates(db, commands);
    return true;
  }

  /**
   * Generate verification code of n digits
   * 
   * @param {number} n Number of digits
   */
  function generateVerificationCode(n) {
    const min = Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
