const functions = require('firebase-functions');
const { db, auth } = require('../shared/admin');
const { onUpdate } = require('../actions/userRoles')(db, auth);

module.exports = functions.region('europe-west2').firestore
  .document('roles/{roleId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const roleId = context.params.roleId;
    await onUpdate(roleId, before, after);
    return true;
  });
