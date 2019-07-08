# JAC Digital Platform

[![CircleCI](https://circleci.com/gh/jac-uk/digital-platform.svg?style=svg)](https://circleci.com/gh/jac-uk/digital-platform)

This project contains components of the JAC Digital Platform which are concerned with handling user applications for 
vacancies.

It's hosted in [Firebase](https://firebase.google.com) (part of [Google Cloud](https://cloud.google.com)).

## Application form

The application form is used by candidates when applying for a vacancy.

Available at https://apply.judicialappointments.digital

More info in [hosting/apply/README.md](hosting/apply/README.md)

## Reference upload

A page allowing referees ('assessors') to upload their references ('independent assessments') to support a candidate's 
application.

Available at https://reference.judicialappointments.digital

More info in [hosting/reference/README.md](hosting/reference/README.md)

## Cloud Functions

[Cloud Functions](https://firebase.google.com/docs/functions/) form the 'backend' of this project. They are 
[Node.js](https://nodejs.org/en/) functions which execute in a serverless environment based on defined triggers.
For example, a function could be 
[triggered every time a new user registers](https://firebase.google.com/docs/functions/auth-events).

More info in [functions/README.md](functions/README.md)

## Project architecture

For the needs of this project, it makes sense for these components to be hosted in one shared Firebase project. 

Conceptually, this works because all components within the project are built around progressing the user's 
application for a vacancy.

Technically, one of the advantages of this approach is that user authentication and application data can be shared 
between components. This enables a Single Sign-on flow in which, for example, a user could create an account on the 
application form whilst applying for a role, and later they'd be able to complete their Qualifying Test by logging in with the same 
credentials.

### Architecture diagram

![Application architecture diagram](docs/jac-digital-platform-architecture.svg)

### One project, multiple sites

Each 'component' in this project (application form, reference upload, etc.) is hosted on its own Firebase Hosting site.

Hosting multiple sites in one project is a feature 
[supported and documented by Firebase](https://firebase.google.com/docs/hosting/multisites).

### Staging and production environments

We use separate Firebase projects as staging and production environments.

For local development we use the staging environment. This allows us to develop and run tests without affecting production data.

- **Staging:** [digital-platform-staging](https://console.firebase.google.com/project/digital-platform-staging/overview)
- **Production:** [application-form-e08c9](https://console.firebase.google.com/project/application-form-e08c9/overview)

## Local development

### Node.js

You must be running **Node.js 10**.

You can use [`nvm`](https://github.com/nvm-sh/nvm) or 
[Homebrew](http://www.ianoxley.com/blog/2018/02/02/managing-node-versions-with-homebrew) to manage installed Node.js versions.

### Firebase CLI

You'll need the [Firebase Command Line Interface (CLI)](https://firebase.google.com/docs/cli) installed to interact with the staging and production projects on 
Firebase.

Install the Firebase CLI:
```
npm install -g firebase-tools
```

Then sign in with your Google account:
```
firebase login
```

Configure Firebase CLI to use the staging environment:
```
firebase use staging
```

### Install project dependencies

Install dependencies for Cloud Functions:
```
cd functions
npm install
```

Install dependencies for Application Form app:
```
cd hosting/apply
npm install
```

Install dependencies for Qualifying Tests app:
```
cd hosting/qt
npm install
```

### Deploy to staging

Deploy to staging using the Firebase CLI:

```
firebase deploy --project staging
```

You can also use [CircleCI](https://circleci.com/gh/jac-uk/digital-platform) to deploy to staging.

Just prefix your branch name with `staging-` and every new push will automatically deploy to staging.

You can also perform [partial deployments](https://firebase.google.com/docs/cli#partial_deploys) to only update specific apps, 
Cloud Functions or Firebase services.

### Deploy to production

We use [CircleCI](https://circleci.com/gh/jac-uk/digital-platform) to deploy to production.

Open a Pull Request to merge your code into the `master` branch.

Once approved, merge your Pull Request and it'll be deployed to production automatically.

