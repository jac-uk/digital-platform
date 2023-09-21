const { getDocument } = require('../shared/helpers');
const { newUser } = require('../shared/factories')();
const { convertPermissions } = require('../shared/permissions');

module.exports = (auth, db) => {
  return {
    generateSignInWithEmailLink,
    createUser,
    deleteUsers,
    importUsers,
    onUserUpdate,
    updateUserCustomClaims,
  };

  async function generateSignInWithEmailLink(ref, email, returnUrl) {
    let hasAccess;
    switch (ref.substring(0, ref.indexOf('/'))) {
      case 'assessments':
        hasAccess = await canAccessAssessments(ref, email);
        break;
      default:
        return false;
    }
    if (!hasAccess) {
      return false;
    } else {
      const actionCodeSettings = {
        url: `${returnUrl}?return=true`,
        handleCodeInApp: true,
      };
      console.log('generateSignInWithEmailLink', ref);
      const emailLink = await auth.generateSignInWithEmailLink(email, actionCodeSettings);
      console.log('generateSignInWithEmailLink DONE', ref);
      return emailLink;
    }
  }

  async function canAccessAssessments(ref, email) {
    // @TODO improve ref validation
    let resource = await getDocument(db.doc(ref));
    if (resource && resource.assessor && resource.assessor.email === email) {
      return true;
    }
    return false;
  }

  /**
   * Create a user
   * 
   * @param {object} user
   *
   */
  async function createUser(user) {
    try {
      const res = await auth.createUser(user);
      return res;
    } catch(error) {
      console.log(error);
      return error;
    }
  }

  /**
   * Delete multiple users
   * 
   * @param {array} uids
   *
   */
   async function deleteUsers(uids) {
    if (!uids || !uids.length) return false;

    const BATCH_SIZE = 1000;
    let result = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };
    try {
      for (let i = 0; i < uids.length; i += BATCH_SIZE - 1) {
        const data = uids.slice(i, i + BATCH_SIZE - 1);
        const res = await auth.deleteUsers(data);
        result.successCount += res.successCount;
        result.failureCount += res.failureCount;
        result.errors = [...result.errors, ...res.errors];
      }
    } catch(error) {
      console.log(error);
    }

    return result;
  }

  /**
   * Import users
   * 
   * @param {array} userImportRecords
   * 
   */
   async function importUsers(userImportRecords) {
    if (!userImportRecords || !userImportRecords.length) return false;

    const BATCH_SIZE = 1000;
    let result = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };
    try {
      for (let i = 0; i < userImportRecords.length; i += BATCH_SIZE - 1) {
        const data = userImportRecords.slice(i, i + BATCH_SIZE - 1);
        const res = await auth.importUsers(data, {
          hash: { algorithm: 'BCRYPT' },
        });  
        result.successCount += res.successCount;
        result.failureCount += res.failureCount;
        result.errors.push(res.errors);
      }
    } catch(error) {
      console.log(error);
    }

    return result;
  }

  /**
   * User updated event handler
   * 
   * @param {string} userId
   * @param {object} dataBefore
   * @param {object} dataAfter
   */
  async function onUserUpdate(userId, dataBefore, dataAfter) {
    const fields = ['displayName', 'email', 'disabled'];
    const data = {};
    fields.forEach(field => {
      if (dataBefore[field] !== dataAfter[field]) data[field] = dataAfter[field];
    });
    
    try {
      if (Object.keys(data).length) {
        await auth.updateUser(userId, data);
      }

      // update role permissions in custom claims
      if (dataBefore.role && dataAfter.role && !dataBefore.role.isChanged && dataAfter.role.isChanged && dataAfter.role.id) {
        const user = await auth.getUser(userId);
        const role = await getDocument(db.collection('roles').doc(dataAfter.role.id));
        if (role) {
          const convertedPermissions = convertPermissions(role);
          const customClaims = user.customClaims || {};
          customClaims.r = dataAfter.role.id;
          customClaims.rp = convertedPermissions;
          await auth.setCustomUserClaims(userId, user.customClaims);
  
          // mark role.isChanged as false
          await db.collection('users').doc(userId).update({
            'role.isChanged': false,
          });
        }
      }

      return true;
    } catch(error) {
      console.log(error);
      return false;
    }
  }


  /**
   * Update user custom claims
   * 
   * @param {string} userId
   */
  async function updateUserCustomClaims(userId) {
    try {
      const userDoc = await getDocument(db.collection('users').doc(userId));
      // update role permissions in custom claims
      if (userDoc) {
        const user = await auth.getUser(userId);
        const role = await getDocument(db.collection('roles').doc(userDoc.role.id));
        if (role) {
          const convertedPermissions = convertPermissions(role);
          const customClaims = user.customClaims || {};
          customClaims.r = role.id;
          customClaims.rp = convertedPermissions;
          await auth.setCustomUserClaims(userId, customClaims);
        }
      }
      return true;
    } catch(error) {
      console.log(error);
      return false;
    }
  }
};
