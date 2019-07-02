# Reference upload

A page allowing referees ('assessors') to upload their references ('independent assessments') to support a candidate's 
application.

This is a simple HTML page which utilises vanilla JavaScript and the 
[Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup).

## Upload workflow

1. Referee receives an email asking for a reference. They complete the reference offline using Microsoft Word (or 
compatible word processor).
2. Referee follows the link in the email to upload their completed reference.
3. The user presses 'Browse', finds the file to upload, and presses 'Submit'.
4. The file is uploaded to a Cloud Storage bucket.
5. A Cloud Function triggers and moves the file to Google Drive.

## Browser support

Works in modern browsers (Chrome, Firefox, Safari, Edge).

Functional in Internet Explorer 11. Does not work in older versions of Internet Explorer.


## Local set up

For local development, open a file in your browser and add an existing reference to your query string (for example, '.../hosting/reference/index.html?ref=REFERENCE_ID'). 
List of existing references is in Firestore under references collection.


## Running Cypress tests locally.

Before running tests, make sure NPM is installed.
We can run Cypress tests in Chrome browser with this command:

```
cypress-local
```

We can also run tests in headless browser with:
```
cypress-headless-local
```


