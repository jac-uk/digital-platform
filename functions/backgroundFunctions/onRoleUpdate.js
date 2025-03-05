import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, auth } from '../shared/admin.js';
import initUserRoles from '../actions/userRoles.js';

const { onUpdate } = initUserRoles(db, auth);

export default onDocumentUpdated('roles/{roleId}', async (event) => {
  const after = event.data.after.data();
  const before = event.data.before.data();
  const roleId = event.params.roleId;
  await onUpdate(roleId, before, after);
  return true;
});
