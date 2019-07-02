# JAC Digital Platform

[![Build Status](https://travis-ci.org/jac-uk/digital-platform.svg?branch=master)](https://travis-ci.org/jac-uk/digital-platform)

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

### Architecture Diagram

![Application architecture diagram](docs/jac-digital-platform-architecture.svg)

### One project, multiple sites

Each 'component' in this project (application form, reference upload, etc.) is hosted on its own Firebase Hosting site.

Hosting multiple sites in one project is a feature 
[supported and documented by Firebase](https://firebase.google.com/docs/hosting/multisites).

### Running apps locally

Before running Qualifying Test app or Application app locally, make sure your current Node version is 8.
Apps are located in hosting folder.

### Setting up Firebase

Install a Firebase CLI:
```
npm install -g firebase-tools
```

Then sign in with your Google account:
```
firebase login
```

