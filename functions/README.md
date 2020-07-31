# Cloud Functions

[Cloud Functions](https://firebase.google.com/docs/functions/) form the 'backend' of this project. They are 
[Node.js](https://nodejs.org/en/) functions which execute in a serverless environment based on defined triggers.

These are useful for performing actions such as sending emails based on actions a user has performed.

For example, a function could be 
[triggered every time a new user registers](https://firebase.google.com/docs/functions/auth-events). It could send 
out a 'welcome' email with an email verification link.

## Sending notification to users

Notify has been configured to work with our `judicialappointments.digital` domain.
The core members of the Digital Team and the Head of Comms have
all been added as Notify admins.  Managment of users should ultimately
fall to the Head of Comms, the Digital Product Manager and the Digital
Lead Developer.

Notify is configured to use JAC branding, and the API. We will need to
have GDS switch us from `trial` to `live` mode in order
to go into production.  This request can be raised via [Notify
support](https://www.notifications.service.gov.uk/support) and can be
done very quickly (usually same-day).

Lastly, the firebase mailer functions [functions/index.js] will expect
the following function configuration variables to be set:

`functions.config().notify.key`--This is API key that authorises us to
make calls to the GOV.UK Notify API.  If needed, this can be re-generated
from the [Notify API
page](https://www.notifications.service.gov.uk/services/0abe6c8e-0b87-4cde-9493-5da4921ccc53/api/keys).

`functions.config().notify.template.verification`--This is the
verification email template id. It can be found in the list
[here](https://www.notifications.service.gov.uk/services/0abe6c8e-0b87-4cde-9493-5da4921ccc53/templates).

`functions.config().production.url`--This should be the URL to the production
site – e.g. `https://apply.judicialappointments.digital`

`functions.config().references.team_drive_id`--This is the Google Team Drive ID in which reference files should be 
stored.

Check firebase configuration variables like this:
```
firebase functions:config:get
```
Set firebase configuration variables like this:
```
firebase functions:config:set slack.url="YOUR_SLACK_INCOMING_WEBHOOK_URL"
```
