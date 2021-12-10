const { getDocument, getDocuments } = require('../shared/helpers');
const PERMISSIONS = require('../shared/permissions');

module.exports = (db, auth) => {

  //TODO: add logging for all changes to roles

  return {
    adminGetUsers,
    adminGetUserRoles,
    adminCreateUserRole,
    adminUpdateUserRole,
    adminSetUserRole,
    adminSetDefaultRole,
    toggleDisableUser,
    disableNewUser,
    adminSyncUserRolePermissions,
  };

  /**
   * Return all users authenticated with google / microsoft (i.e. users who have attempted authentication with admin)
   */
  async function adminGetUsers() {
    // TODO: refactor to add a new users collection with all relevant information in

    let adminUsers = [];

    try {
      // get all users
      const users = await auth.listUsers();

      for(const user of users.users) {
        let isJacAdmin = false;
        let isJACEmployee = false;
        for (const provider of user.providerData) { // users can authenticate on both admin and apply with same email
          if(provider.providerId === 'google.com' || provider.providerId === 'microsoft.com') {
            isJacAdmin = true; // user has authenticated successfully with google or microsoft
            isJACEmployee = user.email.indexOf('@judicialappointments.gov.uk') > 0; // user is part of
          }
        }
        if(isJacAdmin) {
          const adminUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isJACEmployee: isJACEmployee,
            disabled: user.disabled,
            customClaims: user.customClaims,
          };
          adminUsers.push(adminUser);
        }
      }
      return adminUsers;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Create new role
   */
  async function adminCreateUserRole(params) {

    try {
      const rolesRef = db.collection('roles');
      let record = await rolesRef.add({
        roleName: params.roleName,
      });
      record = await getDocument(rolesRef.doc(record.id));
      return record;
    }
    catch(e) {
      console.log(e);
      return e;
    }
  }

  /**
   * Update role permissions
   */
  async function adminUpdateUserRole(params) {

    try {
      await db.collection('roles').doc(params.roleId).update({
        enabledPermissions: params.enabledPermissions,
      });
      return true;
    }
    catch(e) {
      console.log(e);
      return e;
    }
  }

  /**
   * Return all roles
   */
  async function adminGetUserRoles() {

    try {
      const rolesRef = db.collection('roles');
      return await getDocuments(rolesRef);
    }
    catch(e) {
      console.log(e);
      return e;
    }
  }

  /**
   * Return all roles
   */
  async function adminGetUserRole(roleId) {

    try {
      const rolesRef = db.collection('roles');
      return await getDocument(rolesRef.doc(roleId));
    }
    catch(e) {
      console.log(e);
      return e;
    }
  }

  /**
   * Disable / enable user
   */
  async function toggleDisableUser(params) {

    try {
      // get user
      const user = await auth.getUser(params.uid);
      const response = await auth.updateUser(params.uid, {
        disabled: !user.disabled,
      });
      await revokeUserToken(params.uid);
      return { disabled: response.disabled };
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }


  /**
   * Change a user's role
   */
  async function adminSetUserRole(params) {

    try {
      const user = await admin
        .auth()
        .getUser(params.userId);
      user.customClaims.r = params.roleId;
      await admin
        .auth()
        .setCustomUserClaims(params.userId, user.customClaims);
      await adminSyncUserRolePermissions(params.userId);
      await revokeUserToken(params.userId);

      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Change default role for new accounts
   */
  async function adminSetDefaultRole(params) {

    try {
      const rolesRef = db.collection('roles');
      const currentDefault = await getDocuments(rolesRef
        .where('isDefault', '==', true));
      if(currentDefault && currentDefault.length > 0) {
        for(const record of currentDefault) {
          await rolesRef.doc(record.id).update({
            //TODO: update logic so it removes the attribute instead of setting it to false
            isDefault: false,
          });
        }
      }
      await rolesRef.doc(params.roleId).update({
        isDefault: true,
      });
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Disable a new user
   */
  async function disableNewUser(params) {
    try {
      await auth.updateUser(params.uid, {
        disabled: true,
      });
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Sync permissions within
   */
  async function adminSyncUserRolePermissions(uid) {
    try {

      const user = await admin
        .auth()
        .getUser(uid);
      const role = await adminGetUserRole(user.customClaims.r);
      const convertedPermissions = [];
      if(role.enabledPermissions) {
        for(const permission of role.enabledPermissions) {
          convertedPermissions.push(PERMISSIONS[permission]);
        }
      }

      if(JSON.stringify(user.customClaims.rp) !== JSON.stringify(convertedPermissions)) {
        console.log('Updating user permissions');
        user.customClaims.rp = convertedPermissions;
        await admin
          .auth()
          .setCustomUserClaims(uid,  user.customClaims );
        await revokeUserToken(uid);
      }
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Revoke a user's token (to force custom claims regeneration)
   */
  async function revokeUserToken(uid) {

    try {
      await admin
        .auth()
        .revokeRefreshTokens(uid);
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

};
