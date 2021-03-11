# JAC Digital Platform

This repository contains backend components and configuration of the [JAC digital platform](https://github.com/jac-uk/documentation/blob/master/docs/index.md).


We have kept folder and file names closely aligned to the corresponding Firebase and Google Cloud services.

## Database

See [database/firestore.rules](database/firestore.rules) for our current rules.

See [database/firestore.indexes.json](database/firestore.indexes.json) for our current indexes.

## Storage

See [storage/storage.rules](storage/storage.rules) for our current rules.


## Functions

See [functions/backgroundFunctions](functions/backgroundFunctions) for our functions which are triggered when defined events happen.

See [functions/callableFunctions](functions/callableFunctions) for our HTTPS callable functions.

See [functions/scheduledFunctions](functions/scheduledFunctions) for functions triggered according to a pre-defined schedule.



<!--
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



### Running an emulated firebase database locally

firebase emulators:start --only functions



### Running a tests on an emulated firebase database locally

firebase emulators:exec "npm run test:functions"

-->
