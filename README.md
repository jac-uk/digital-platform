# application-form

[![Build Status](https://travis-ci.org/JudicialAppointmentsCommission/application-form.svg?branch=master)](https://travis-ci.org/JudicialAppointmentsCommission/application-form)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Runs unit tests

```
export FIREBASE_CONFIG='testAccountKey.json'
npm test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

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
