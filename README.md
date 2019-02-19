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
npm test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Sending notification to users

We are using [GOVUK Notify](https://www.notifications.service.gov.uk) to
handle all automatic communications from the service.  This is currently
only email, but we may use the Notify Text and Postal options in the
future.

Notify has been configured to work with our `judicialappointments.digital` domain.
The core members of the Digital Team and the Head of Comms have
all been added as Notify admins.  Managment of users should ultimately
fall to the Head of Comms, the Digital Product Manager and the Digital
Lead Developer.

At the time of writing, 2019-02-19, Notify is configured to use the
standard GDS design template (Crown branding), and the API key is
restricted to only send messages within JAC digital.  We will need to
ask GDS to change the design templates to reflect our branding (we can
edit the content templates, directly) and we will also need to have GDS
switch us from `trial` to `live` mode in order to go into production.
Both of these requests can be raised via [Notify
support](https://www.notifications.service.gov.uk/support) and can be done
very quickly (usually same-day).

Lastly, the firebase mailer functions [functions/index.js] will expect
`functions.config().notify.api_key` to be set to the API key generated
from the
[Notify API page](https://www.notifications.service.gov.uk/services/0abe6c8e-0b87-4cde-9493-5da4921ccc53/api/keys).



