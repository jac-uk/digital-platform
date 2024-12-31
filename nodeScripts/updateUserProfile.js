/*

Update a user profile in Firebase Authentication database

How to use:

- Run the script: npm run nodeScript updateUserProfile

*/

'use strict';

import { app, db, auth } from './shared/admin.js';
import { getDocuments } from '../functions/shared/helpers.js';
import initUpdateUser from '../functions/actions/candidates/updateUser.js';

const updateUser = initUpdateUser(auth);

const main = async () => {
  const candidates = await getDocuments(db.collection('candidates').where('fullName', '!=', ''));
  
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(candidate.id, candidate.fullName);
    await updateUser(candidate.id, { displayName: candidate.fullName });
  }

  return candidates.length;
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
