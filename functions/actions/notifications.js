const { getDocument, getDocuments, applyUpdates } = require('../shared/helpers');

module.exports = (config, firebase, db) => {
  const { sendEmail, previewEmail } = require('../shared/notify')(config);
  return {
    processNotifications,
    previewNotification,
    testNotification,
    emptyNotificationsQueue,
  };

  /**
   * processNotifications
   * Grabs a batch of notifications from the queue
   * NB. The rate limit for calling Notify is 3,000 per minute
   */
  async function processNotifications() {

    const NOTIFICATIONS_BATCH_SIZE = 1000;

    const services = await getDocument(db.doc('settings/services'));

    if (services.notifications && services.notifications.isProcessing === true) {
      const delayBeforeSendMinutes = services.notifications.delayInMinutes || 5;

      // get next batch of notifications
      let dateLessDelay = new Date(Date.now() - (delayBeforeSendMinutes * 60 * 1000));
      const notifications = await getDocuments(
        db.collection('notifications')
          .where('status', '==', 'ready')
          .where('createdAt', '<=', dateLessDelay)
          .limit(NOTIFICATIONS_BATCH_SIZE)
      );

      // send to Notify
      const sendToRecipient = services.notifications.sendToRecipient;
      const promises = [];
      const commands = [];
      for (let i = 0, len = notifications.length; i < len; ++i) {
        const notification = notifications[i];
        let toEmail = sendToRecipient ? notification.email : notification.replyTo;
        if (!toEmail) { toEmail = services.notifications.defaultMailbox; }
        promises.push(
          sendEmail(
            toEmail,
            notification.template.id,
            notification.personalisation
          ).then((result) => {
            if (result === true) {
              commands.push({
                command: 'update',
                ref: notification.ref,
                data: {
                  status: 'sent',
                  sentAt: firebase.firestore.Timestamp.fromDate(new Date()),
                  sentTo: toEmail,
                },
              });
            } else {
              commands.push({
                command: 'update',
                ref: notification.ref,
                data: {
                  status: 'failed',
                },
              });
            }
            return result;
          })
        );
      }
      await Promise.all(promises);

      // process commands
      const result = await applyUpdates(db, commands);
      return result ? notifications.length : false;
    }

    return 0;
  }

  async function previewNotification(notificationId) {
    console.log('previewNotification', notificationId);
    return previewEmail(notificationId);
  }

  function testNotification(notification, email) {
    return sendEmail(
      email,
      notification.template.id,
      notification.personalisation
    );
  }

  async function emptyNotificationsQueue() {
    const notifications = await getDocuments(
      db.collection('notifications')
        .where('status', '==', 'ready')
        .select()
    );
    for (let i = 0, len = notifications.length; i < len; ++i) {
      await notifications[i].ref.delete();
    }
    return notifications.length;
  }

};
