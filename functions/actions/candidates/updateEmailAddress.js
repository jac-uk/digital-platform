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

    console.log('Send email ...');

    const currentEmailAddress = data.currentEmailAddress;
    const newEmailAddress = data.newEmailAddress;

    console.log('In updateEmailAddress ...');

    try {
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      console.log('Validating');

      if (emailRegEx.test(currentEmailAddress) === true && (emailRegEx.test(newEmailAddress) === true)) {

        console.log('Valid email');

        const currentUser = await auth.getUserByEmail(currentEmailAddress);

        // Check if the new email already exists (throws an error if the user is NOT found, which we need to catch)
        let newEmailUser = null;
        try {
          newEmailUser = await auth.getUserByEmail(newEmailAddress);
        } catch (e1) {
            // eslint-disable-next-line no-empty
        }

        console.log(`Check for email: ${newEmailAddress}`);
        console.log('newEmailUser:');
        console.log(newEmailUser);

        if (newEmailUser) {

          console.log('RETURNING ERROR AS EMAIL ALREADY EXISTS!');

          return {
            status: 'error',
            data: {
              code: 'auth/email-already-exists',
              message: 'Unable to update email at this time. Please contact the admin if the problem persists.',
            },
          };
        }
        
        console.log('EMAIL UNIQUE SO UPDATING USER');

        // Update user
        const updatedUser = await auth.updateUser(
          currentUser.uid,
          {
            email: newEmailAddress,
            emailVerified: false,   // Ensure the user must verify the email
          }
        );

        console.log(`Email updated successfully for UID: ${currentUser.uid}`);

        // Generate email verification link
        const verificationLink = await auth.generateEmailVerificationLink(newEmailAddress);
        console.log(`Verification email link generated: ${verificationLink}`);



        // @TODO: Uncomment below and make notify service woerk on develop!

        // Send the verification email
        // const commands = [];
        // commands.push({
        //   command: 'set',
        //   ref: db.collection('notifications').doc(),
        //   data: newNotificationEmailVerificationLink(firebase, newEmailAddress, verificationLink),
        // });
        // const result = await applyUpdates(db, commands);
        
        // if (result) {

        //   console.log('The email verification link was sent ok.');

        //   return {
        //     status: 'success',
        //     data: updatedUser,
        //   };
        // }
        // else {

        //   console.log('The email verification link could not be sent.');

        //   return {
        //     status: 'error',
        //     data: {
        //       code: 'auth/verification-link-send-failure',
        //       message: 'The email verification link could not be sent.',
        //     },
        //   };
        // }


        // @TODO: REMOVE
        return {
          status: 'success',
          data: updatedUser,
        };

        

      } else {

        console.log('Invalid email');

        return {
          status: 'error',
          data: {
            code: 'auth/invalid-email',
            message: 'The email address is badly formatted.',
          },
        };
      }
    } catch(e) {
      return {
        status: 'error',
        data: e.errorInfo,
      };
    }
  }

};
