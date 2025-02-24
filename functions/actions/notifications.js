import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';
import initNotify from '../shared/notify.js';

export default (firebase, db) => {
  const { sendEmail, previewEmail, sendSMS } = initNotify();
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

      // Get the next batch of notifications
      const dateLessDelay = new Date(Date.now() - delayBeforeSendMinutes * 60 * 1000);
      const notifications = await getDocuments(
        db.collection('notifications')
          .where('status', '==', 'ready')
          .where('createdAt', '<=', dateLessDelay)
          .limit(NOTIFICATIONS_BATCH_SIZE)
      );

      const sendToRecipient = services.notifications.sendToRecipient;
      const promises = [];
      const commands = [];

      for (const notification of notifications) {
        // SMS notification handling
        if (notification.type === 'sms') {
          const toMobile = notification.mobile;
          promises.push(
            sendSMS(toMobile, notification.template.id, notification.personalisation)
              .then((result) => {
                commands.push({
                  command: 'update',
                  ref: notification.ref,
                  data: result
                    ? { status: 'sent', sentAt: firebase.firestore.Timestamp.fromDate(new Date()), sentTo: toMobile }
                    : { status: 'failed' },
                });
                return result;
              })
          );
        } else {
          // Email notification handling
          const toEmail = sendToRecipient ? notification.email : notification.replyTo || services.notifications.defaultMailbox;
          promises.push(
            sendEmail(toEmail, notification.template.id, notification.personalisation)
              .then((result) => {
                commands.push({
                  command: 'update',
                  ref: notification.ref,
                  data: result
                    ? { status: 'sent', sentAt: firebase.firestore.Timestamp.fromDate(new Date()), sentTo: toEmail }
                    : { status: 'failed' },
                });
                return result;
              })
          );
        }
      }

      // Process all promises
      await Promise.all(promises);

      // Process commands
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
