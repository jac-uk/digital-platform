'use strict';
import { app, db, firebase } from './shared/admin.js';
import { addChecksumToFirestore } from '../functions/actions/malware-scanning/addChecksumToFirestore.js';

const addChecksum = addChecksumToFirestore(firebase, db);

const main = async () => {
  return addChecksum('blank.docx', 'ed2dfa9b93adbdd11e3a6c3b77bb22d6d8a6dea8c66b90ce54ec8cfc6cdb1425');
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
