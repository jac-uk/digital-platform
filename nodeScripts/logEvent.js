'use strict';

const { app, db, firebase, auth } = require('./shared/admin');
const { logEvent } = require('../functions/actions/logs/logEvent')(firebase, db, auth);

const main = async () => {
  return logEvent('info', 'CV letter uploaded', {
    applicationId: 'aaaaaa',
    candidateName: 'bbbbbb',
    exerciseRef: 'cccccc',
  }); 
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
