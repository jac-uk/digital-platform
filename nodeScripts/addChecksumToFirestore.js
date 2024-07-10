'use strict';
const { app, db, firebase} = require('./shared/admin.js');
const { addChecksumToFirestore } = require('../functions/actions/malware-scanning/addChecksumToFirestore.js')(firebase, db);

const main = async () => {
  return addChecksumToFirestore('blank.docx', 'ed2dfa9b93adbdd11e3a6c3b77bb22d6d8a6dea8c66b90ce54ec8cfc6cdb1425');
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
