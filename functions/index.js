const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require('notifications-node-client').NotifyClient

admin.initializeApp()

exports.sendVerificationEmail = functions.auth.user().onCreate((user) => {
	const notifyClient = new NotifyClient(functions.config().notify.key)
	const email = user.email
  const displayName = user.displayName

	const callNotifyClient = (email, displayName, link) => {
		notifyClient
			.sendEmail(
				functions.config().notify.templates.verification,
				email,
				{ personalisation: { } }
			)
	}

	return admin.auth().generateEmailVerificationLink(email)
    .then((link) => {
      return callNotifyClient(email, displayName, link)
    })
});
