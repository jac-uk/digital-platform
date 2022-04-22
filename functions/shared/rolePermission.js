const functions = require('firebase-functions');
const { getDocument } = require('./helpers');

module.exports = (db) => {
  return {
    getAllPermissions,
    getRoleEnabledPermissions,
    isEnabledPermission,
    hasPermission,
  };

  async function getAllPermissions() {
    try {
      const res = await getDocument(db.doc('settings/permissions'));
      return res.permissions;
    } catch (error) {
      return [];
    }
  }

  async function getRoleEnabledPermissions(roleId) {
    try {
      const res = await getDocument(db.doc(`roles/${roleId}`));
      return res.enabledPermissions;
    } catch (error) {
      return [];
    }
  }

  async function isEnabledPermission(permission) {
    try {
      const allPermissions = await getAllPermissions();
      let enable = false;
      for (let i = 0; i < allPermissions.length; i++) {
        const item = allPermissions[i];
        for (let j = 0; j < item.permissions.length; j++) {
          const p = item.permissions[j];
          if (p.value === permission && p.enable) {
            enable = true;
            break;
          }
        }

        if (enable) break;
      }
      return enable;
    } catch (error) {
      return false;
    }
  }

  async function hasPermission(roleId, permission) {
    const enabledPermissions = await getRoleEnabledPermissions(roleId);
    const enable = await isEnabledPermission(permission);
    if (!enabledPermissions.includes(permission)) {
      throw new functions.https.HttpsError('failed-precondition', 'Permission denied');
    } else if (!enable) {
      throw new functions.https.HttpsError('failed-precondition', 'Permission disabled');
    }
    return;
  }
};
