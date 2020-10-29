'use strict';

const { app, auth, db } = require('./shared/admin.js');
const { generateSignInWithEmailLink } = require('../functions/actions/users.js')(auth, db);

const main = async () => {
  // return generateSignInWithEmailLink('assessments/testData-1-1', 'warren3@precise-minds.co.uk', 'http://localhost:8082/sign-in');
  return generateSignInWithEmailLink('assessments/testData-0-1', 'warren2@precise-minds.co.uk', 'https://assessments-develop.judicialappointments.digital/sign-in');
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
