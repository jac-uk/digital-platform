const { getDocument } = require('../shared/helpers');

module.exports = (auth, db) => {
  const  { adminSetUserRole } = require('./userRoles')(db, auth);

  return {
    generateSignInWithEmailLink,
    createUser,
    updateUser,
    deleteUsers,
    importUsers,
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
   * Update a user
   * 
   * @param {string} userId
   * @param {object} dataBefore
   * @param {object} dataAfter
   */
  async function updateUser(userId, dataBefore, dataAfter) {
    const data = {};
    if (dataBefore.name !== dataAfter.name) data.displayName = dataAfter.name;
    if (dataBefore.email !== dataAfter.email) data.email = dataAfter.email;
    if (dataBefore.disabled !== dataAfter.disabled) data.disabled = dataAfter.disabled;
    
    try {
      if (Object.keys(data).length) {
        await auth.updateUser(userId, data);
      }
      return true;
    } catch(error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Create a user
   * 
   * @param {object} user
   *
   */
   async function createUser(user) {
    const { name, email, password, roleId } = user;
    try {
      // create user in authentication database
      const newUser = await auth.createUser({ email, password, displayName: name });

      // set user role in custom claims
      await adminSetUserRole({
        userId: newUser.uid,
        roleId,
      });

      // create user in firestore
      const data = {
        name,
        email,
        providerData: JSON.parse(JSON.stringify(newUser.providerData)),
        disabled: newUser.disabled,
        role: {
          id: roleId,
          isChanged: false,
        },
      };
      await db.collection('users').doc(newUser.uid).set(data);

      return {
        status: 'success',
        data: { id: newUser.uid, ...data },
      };
    } catch(error) {
      return {
        status: 'error',
        data: error,
      };
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

};
