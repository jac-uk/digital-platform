# JAC Digital Platform

This repository contains backend components and configuration of the [JAC digital platform](https://github.com/jac-uk/documentation/blob/master/docs/index.md).


We have kept folder and file names closely aligned to the corresponding Firebase and Google Cloud services.

## Database

See [database/firestore.rules](database/firestore.rules) for our Firestore database rules.

See [database/realtime.rules.json](database/realtime.rules.json) for our Realtime Database rules.

See [database/firestore.indexes.json](database/firestore.indexes.json) for our current indexes.

## Storage

See [storage/storage.rules](storage/storage.rules) for our current rules.

To run the emulator on your local machine, create a `./data/firestore.json` file with the contents of `[]`.
Install the dependency for this script globally:

``` npm install -g node-firestore-import-export```

Once installed, you can run `db:export` to get a copy of the current `digital-platform-develop` repository, which will save
a deep copy of the entire firestore DB into the `/data/firestore.json` file.

Set up the emulators by running `npm run firestore` which will just boot up the firestore gcloud emulation. You may need to
install this by following [this guide](https://firebase.google.com/docs/firestore/security/test-rules-emulator#install_the_emulator).
This will run on port **8282** to avoid port conflicts. The interface, however, will run on **4000** as normal.

Once the emulator is running, you may import the local copy made into the emulator with 

```npm run db:emulator:import```

This command will set the environment variables and import into the local copy. You only need to do this once,
data will be re-exported and then automatically imported on restart of the firestore emulator.

To run the jest tests with `npm run test:rules` against your local emulator, you'll have to export or set the environment variable.

```set FIRESTORE_EMULATOR_HOST=localhost:8282```

```export FIRESTORE_EMULATOR_HOST="localhost:8282"```

depending on your operating system.

## Functions

See [functions/backgroundFunctions](functions/backgroundFunctions) for our functions which are triggered when defined events happen.

See [functions/callableFunctions](functions/callableFunctions) for our HTTPS callable functions.

See [functions/scheduledFunctions](functions/scheduledFunctions) for functions triggered according to a pre-defined schedule.



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

### Deploy a single function to develop

```
npx firebase deploy --project=digital-platform-develop --only functions:exportApplicationCharacterIssues
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
