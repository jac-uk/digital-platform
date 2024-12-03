import initFactories from '../../shared/factories.js';
import { applyUpdates } from '../../shared/helpers.js';

export default (config, auth, firebase, db) => {

  const {
    newNotificationEmailVerificationLink,
  } = initFactories(config);

  return updateEmailAddress;

  /**
   * Update candidate login email address
   */
  async function updateEmailAddress(data) {
    const currentEmailAddress = data.currentEmailAddress;
    const newEmailAddress = data.newEmailAddress;
    try {
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegEx.test(currentEmailAddress) === true && (emailRegEx.test(newEmailAddress) === true)) {
        const currentUser = await auth.getUserByEmail(currentEmailAddress);

        // Check if the new email already exists (throws an error if the user is NOT found, which we need to catch)
        let newEmailUser = null;
        try {
          newEmailUser = await auth.getUserByEmail(newEmailAddress);
        } catch (e1) {
            // eslint-disable-next-line no-empty
        }

        if (newEmailUser) {
          return {
            status: 'error',
            data: {
              code: 'auth/email-already-exists',
              message: 'Unable to update email at this time. Please contact the admin if the problem persists.',
            },
          };
        }
        
        // Update user
        const updatedUser = await auth.updateUser(
          currentUser.uid,
          {
            email: newEmailAddress,
            emailVerified: false,   // Ensure the user must verify the email
          }
        );

        // Generate email verification link
        const verificationLink = await auth.generateEmailVerificationLink(newEmailAddress);

        // Send the verification email
        const commands = [];
        commands.push({
          command: 'set',
          ref: db.collection('notifications').doc(),
          data: newNotificationEmailVerificationLink(firebase, newEmailAddress, verificationLink),
        });

        const result = await applyUpdates(db, commands);
        
        if (result) {
          return {
            status: 'success',
            data: updatedUser,
          };
        }
        else {
          return {
            status: 'error',
            data: {
              code: 'auth/verification-link-send-failure',
              message: 'The email verification link could not be sent.',
            },
          };
        }
      }
      else {
        return {
          status: 'error',
          data: {
            code: 'auth/invalid-email',
            message: 'The email address is badly formatted.',
          },
        };
      }
    } catch(e) {

      console.log('Error:');
      console.log(e);

      return {
        status: 'error',
        data: e.errorInfo,
      };
    }
  }
};
