import { NotifyClient } from 'notifications-node-client';

export default () => {

  return {
    sendEmail,
    previewEmail,
    sendSMS,
  };

  function sendEmail(email, templateId, personalisation) {
    const client = new NotifyClient(process.env.NOTIFY_KEY);

    // console.info({
    //   action: 'Sending email',
    //   email,
    //   templateId,
    //   personalisation,
    // });

    return client
      .sendEmail(
        templateId,
        email,
        { personalisation }
      )
      .then(() => {
        // console.info(notifyResponse.body);
        return true;
      })
      .catch(err => {
        console.error('Error Sending Email:', JSON.stringify(err));
        return false;
      });
  }

  function previewEmail(notificationId) {
    console.log('preview email', notificationId);
    const client = new NotifyClient(process.env.NOTIFY_KEY);
    return client
      .getTemplateById(notificationId)
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
  }

  function sendSMS(intlMobileNumber, templateId, personalisation) {
    const client = new NotifyClient(process.env.NOTIFY_KEY);
    return client
      .sendSms(templateId, intlMobileNumber, {
        personalisation: personalisation,
        reference: null,
      })
      .then(response => {
        console.info(response);
        return true;
      })
      .catch(err => {
        console.error('Error Sending SMS:', JSON.stringify(err.response.data));
        return false;
      });
  }
};
