# Google Apps Scripts for test support

[Google Apps Scripts](https://developers.google.com/apps-script/) are cloud functions that are tightly tied to various G-Suite
apps. At best these are difficult to test and manage and normally have to be accessed and configured via the particular service's
script editor (not linked due to the low level way it is scoped). 

This directory is meant to be the centralised repo for keeping track of all the JAC's App Scripts.

## Installation

### writeAnswersToFirestore.gas

1. Open your form in edit view
1. Open the `Three dot menu -> Script Editor`
1. Give the project a name
    * click on `Untitled Project` in the top navigation
1. Associate this project with the application form (digital platform) cloud platform project: `Resources -> Cloud Platform
   project -> Change project`
    *  You can find the `Project number` in the [Cloud console](https://console.cloud.google.com/) 
    *  This ensures logs and error reporting go into the application form project and not into a new project
1. Replace the contents of the script editor with
   [google-forms/writeAnswersToFirestore.js](google-forms/writeAnswersToFirestore.js) and save
1. Change the target endpoint (`<CHANGE TO...`) to point at the correct function
1. `Edit -> Current project's triggers -> Add trigger`
1. Choose Which Function to run -> `onSubmit`
1. Choose which deployment should run -> `Head`
1. Select event source -> `From form`
1. Select event type -> `On form submit`
1. Save
