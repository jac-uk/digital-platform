import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';
import { PERMISSIONS } from '../shared/permissions.js';

export default (db, auth) => {

  //TODO: add logging for all changes to roles

  return {
    onUpdate,
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
   * Role event handler for Update
   * 
   * @param {string} roleId
   * @param {object} dataBefore
   * @param {object} dataAfter
   */
  async function onUpdate(roleId, dataBefore, dataAfter) {
    const commands = [];
    // check if permissions have changed
    if (JSON.stringify(dataBefore.enabledPermissions) !== JSON.stringify(dataAfter.enabledPermissions)) {
      // mark all users with this role as changed
      const users = await getDocuments(db.collection('users').where('role.id', '==', roleId));
      users.forEach(user => {
        if (!user.role.isChanged) {
          commands.push({
            command: 'update',
            ref: user.ref,
            data: {
              'role.isChanged': true,
            },
          });
        }
      });
    }
    
    if (commands.length) {
      await applyUpdates(db, commands);
    }
  }

  /**
   * Return all users authenticated with google / microsoft (i.e. users who have attempted authentication with admin)
   */
  async function adminGetUsers() {
    // TODO: refactor to add a new users collection with all relevant information in

    let adminUsers = [];

    try {
      // get all users
      const users = [];
      await listAllUsers(users);
      for (const user of users) {

        let isJacAdmin = false;
        if (user.providerData.length === 1) {
          const provider = user.providerData[0];
          if (user.email.match(/(.*@judicialappointments|.*@justice)[.](digital|gov[.]uk)/) && 
            (provider.providerId === 'google.com' || provider.providerId === 'microsoft.com' || provider.providerId === 'password')) {
            isJacAdmin = true; // user has authenticated successfully with google or microsoft
          }
        } else if (user.providerData.length > 1) {
          isJacAdmin = true;
        } else {
          isJacAdmin = false;
        }

        if (isJacAdmin) {
          const adminUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isJACEmployee: true, // this field is currently redundant due to change on checking whether is JAC employee
            disabled: user.disabled,
            customClaims: user.customClaims,
            providerData: user.providerData,
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

  async function listAllUsers(users, nextPageToken) {
    // List batch of users, 1000 at a time.
    try {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      users.push(...listUsersResult.users);
      if (listUsersResult.pageToken) {
        // List next batch of users.
        await listAllUsers(users, listUsersResult.pageToken);
      }
    } catch (error) {
      console.log('Error listing users:', error);
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
   * Return role by roleId
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
      const user = await auth.getUser(params.userId);
      let customClaims = user.customClaims || {};
      customClaims.r = params.roleId;
      await auth.setCustomUserClaims(params.userId, customClaims);
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
      const user = await auth.getUser(uid);
      const roleId = user.customClaims.r;
      if (roleId) {
        const role = await adminGetUserRole(roleId);
        const convertedPermissions = [];
        if (role.enabledPermissions && role.enabledPermissions.length > 0) {
          for (const permission of role.enabledPermissions) {
            for (const group of Object.keys(PERMISSIONS)) {
              for (const p of Object.keys(PERMISSIONS[group].permissions)) {
                if (p === permission) {
                  convertedPermissions.push(PERMISSIONS[group].permissions[p].value);
                }
              }
            }
          }
        }
  
        if (JSON.stringify(user.customClaims.rp) !== JSON.stringify(convertedPermissions)) {
          console.log('Updating user permissions');
          user.customClaims.rp = convertedPermissions;
          await auth.setCustomUserClaims(uid, user.customClaims);
          await revokeUserToken(uid);
        }
        return convertedPermissions;
      } else {
        return [];
      }
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
      await auth.revokeRefreshTokens(uid);
      return true;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }
};
