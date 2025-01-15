'use strict';

import { firebase, app, db } from './shared/admin.js';
import initExportApplicationCharacterIssues from '../functions/actions/exercises/exportApplicationCharacterIssues.js';

const { exportApplicationCharacterIssues } = initExportApplicationCharacterIssues(firebase, db);

const main = async () => {
  return exportApplicationCharacterIssues('aRrY8ad5TwiznZZhBqee', 'all', 'all', 'googledoc');
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
