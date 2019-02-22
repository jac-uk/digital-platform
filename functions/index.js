const admin = require("firebase-admin");
const functions = require("firebase-functions");
const NotifyClient = require('notifications-node-client').NotifyClient

admin.initializeApp()

exports.sendValidationEmail = functions.auth.user().onCreate((user) => {
  const notifyClient = new NotifyClient(functions.config().notify.key)
  const email = user.email
  const displayName = user.displayName

  notifyClient
    .sendEmail(
      functions.config().notify.templates.validation,
      email,
      { personalisation: { } }
    )
  return true
});
