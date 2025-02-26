'use strict';

import { app, db } from './shared/admin.js';
import initChangeIATemplate from '../functions/actions/changeIATemplate.js';

const { changeIATemplate: changeIATemplate } = initChangeIATemplate(db);

const main = async () => {
  return changeIATemplate (
    ''); // enter exercise id
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
