import * as functions from 'firebase-functions/v1';
import { db, auth } from '../shared/admin.js';
import initUserRoles from '../actions/userRoles.js';

const { onUpdate } = initUserRoles(db, auth);

export default functions.region('europe-west2').firestore
  .document('roles/{roleId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    const roleId = context.params.roleId;
    await onUpdate(roleId, before, after);
    return true;
  });
