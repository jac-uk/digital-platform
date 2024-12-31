'use strict';

import { firebase, app, db } from './shared/admin.js';
import initSearch from '../functions/actions/candidates/search.js';

const search = initSearch(firebase, db);

const main = async () => {
  // return search.updateCandidate('05eaMEUNA0NfA6uhhd4kxYzU2of2');
  return search.updateAllCandidates();
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
