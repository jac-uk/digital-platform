import { getDocument, getDocuments, hashEmail } from '../shared/helpers.js';
import { convertPermissions } from '../shared/permissions.js';
import { getSearchMap } from '../shared/search.js';
import  initToken from '../shared/token.js';
export default (auth, db, config) => {
  const { verifyToken } = initToken(config);

  return {
    createFirebaseEmailLink,
    generateSignInWithEmailLink,
    createUser,
    updateUser,
    deleteUsers,
    importUsers,
    onUserCreate,
    onUserUpdate,
    updateUserCustomClaims,
    getUserSearchMap,
    getUserByGithubUsername,
    getUser,
  };

  async function createFirebaseEmailLink(params) {
    const { token, returnUrl } = params;
    const result = {
      success: false,
      emailLink: null,
      ref: null,
      email: null,
      errorMsg: null,
    };

    // verify token
    let payload = null;
    try {
      payload = verifyToken(token);      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        result.errorMsg = 'token-expired';
      } else {
        result.errorMsg = 'invalid-token';
      }
      return result;
    }

    // parse token
    const { ref, identity } = payload;
    if (!ref || !identity) {
      result.errorMsg = 'invalid-token';
      return result;
    }

    let hasAccess = false;
    let email = null;
    switch (ref.substring(0, ref.indexOf('/'))) {
      case 'assessments':
        ({ hasAccess, email } = await canAccessAssessments(ref, identity));
        break;
      default:
        result.errorMsg = 'invalid-token';
        return result;
    }

    if (!email) {
      result.errorMsg = 'invalid-token';
      return result;
    }
    if (!hasAccess) {
      result.errorMsg = 'cannot-access';
      return result;
    }
    
    // generate firebase email link
    if (!result.errorMsg) {
      result.success = true;

      const actionCodeSettings = {
        url: `${returnUrl}?return=true`,
        handleCodeInApp: true,
      };
      console.log('generateSignInWithEmailLink', ref);
      const emailLink = await auth.generateSignInWithEmailLink(email, actionCodeSettings);
      console.log('generateSignInWithEmailLink DONE', ref);
      
      // include in result
      result.emailLink = emailLink;
      result.ref = ref;
      result.email = email;
    }

    return result;
  }


  async function generateSignInWithEmailLink(ref, email, returnUrl) {
    let hasAccess;
    switch (ref.substring(0, ref.indexOf('/'))) {
      case 'assessments':
        ({ hasAccess } = await canAccessAssessments(ref, hashEmail(email)));
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

  async function canAccessAssessments(ref, emailHash) {
    // @TODO improve ref validation
    let resource = await getDocument(db.doc(ref));
    if (resource && resource.assessor && hashEmail(resource.assessor.email) === emailHash) {
      return {
        hasAccess: true,
        email: resource.assessor.email,
      };
    }
    return {
      hasAccess: false,
      email: null,
    };
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
   * Update a user
   * @param {string} userId 
   * @param {object} data 
   * @returns 
   */
  async function updateUser(userId, data) {
    try {
      return await db.collection('users').doc(userId).update(data);
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

  async function getUserByGithubUsername(githubUsername) {
    const usersRef = db.collection('users').where('githubUsername', '==', githubUsername);
    let users = await getDocuments(usersRef);
    if (users.length === 0) {
      return null;
    }
    return users[0];
  }

  async function getUser(userId) {
    return getDocument(db.collection('users').doc(userId));
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
   * User created event handler
   * - Add _search for search and sorting
   */
  async function onUserCreate(ref, data) {
    const userData = {
      _search: getUserSearchMap(data),
    };
    await ref.update(userData);
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
      if (data.displayName || !dataAfter._search) {
        console.log('Set _search for search and sorting');
        Object.assign(data, { _search: getUserSearchMap(dataAfter)});
      }
      if (Object.keys(data).length) {
        console.log('Updating user data:');
        console.log(JSON.stringify(data));
        await auth.updateUser(userId, data);
        await db.collection('users').doc(userId).update(data);
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
          await auth.setCustomUserClaims(userId, customClaims);
  
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

  /**
   * 
   * @param {object} user 
   * @returns {array}
   */
  function getUserSearchMap(user) {
    return getSearchMap([
      user.displayName,
      user.email,
    ]);
  }
};
