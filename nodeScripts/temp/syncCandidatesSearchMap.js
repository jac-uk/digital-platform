'use strict';

/**
 * Node script to update the searchMap (_search) in all candidates
 * The search map is for:
 * exercise name, exercise referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncCandidatesSearchMap.js
 */

import { firebase, app, db } from '../shared/admin.js';
import initSearch from '../../functions/actions/candidates/search.js';

const search = initSearch(firebase, db);

const main = async () => {
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
