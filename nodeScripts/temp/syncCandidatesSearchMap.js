'use strict';

/**
 * Node script to update the searchMap (_search) in all candidates
 * The search map is for:
 * exercise name, exercise referenceNumber
 * 
 * Run with: > npm run local:nodeScript temp/syncCandidatesSearchMap.js
 */

const { firebase, app, db } = require('../shared/admin.js');
const { getDocuments, applyUpdates } = require('../../functions/shared/helpers.js');
const { getSearchMap } = require('../../functions/shared/search.js');
const { objectHasNestedProperty } = require('../../functions/shared/helpers.js');

async function updateAllCandidates() {
  const commands = [];
  const candidates = await getDocuments(db.collection('candidates').select('nationalInsuranceNumber', 'fullName', 'email'));
  for (let i = 0, len = candidates.length; i < len; ++i) {
    const candidate = candidates[i];

    const searchable = [
      candidate.fullName,
      candidate.email,
    ];

    // Check if national insurance number exists
    const hasNationalInsuranceNumber = objectHasNestedProperty(candidate, 'computed.nino');

    if (hasNationalInsuranceNumber) {
      searchable.push(candidate.computed.nino);
    }

    commands.push({
      command: 'update',
      ref: db.collection('candidates').doc(candidate.id),
      data: {
        _search: getSearchMap(searchable),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        'computed.search': firebase.firestore.FieldValue.delete(), // Remove nested field
      },
    });
  }

  // write to db
  const result = await applyUpdates(db, commands);
  return result ? candidates.length : false;
}

const main = async () => {
  return updateAllCandidates();
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
