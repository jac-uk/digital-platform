import { getDocument, getDocuments } from '../shared/helpers.js';
import { convertPermissions } from '../shared/permissions.js';
import { getSearchMap } from '../shared/search.js';
import initGoogleSheet from '../shared/google-sheet.js';

const googleSheet = initGoogleSheet();

export default (auth, db) => {
  return {
    generateSignInWithEmailLink,
    createUser,
    updateUser,
    deleteUsers,
    importUsers,
    onUserCreate,
    onUserUpdate,
    updateUserCustomClaims,
    getUserSearchMap,
    getBugRotaUser,
    getQuestionAssigneeUsers,
    getUserByGithubUsername,
    getUsersByEmails,
    getUser,
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

  async function getBugRotaGoogleSheet(range) {
    const spreadsheetId = '1E_ppJmSiI0uF7lpXXwuuDYD8PO2ETse316xgSgM1yCw';
    const result = await googleSheet.getValues(spreadsheetId, range);
    if (!result || !result.data || !result.data.values) return null;
    const list = result.data.values;
    return list;
  }

  async function getBugRotaUser() {
    const list = await getBugRotaGoogleSheet('Developer');
    const startOfWeek = formatDate(getStartOfWeek(new Date())); // Start of this week
    const match = list.find(row => row[0].trim() === startOfWeek);
    if (!match || !match[2]) return null;
    const email = match[2].trim();
    return await getUserByEmail(email);
  }

  async function getQuestionAssigneeUsers() {
    const list = await getBugRotaGoogleSheet('Question Assignee');
    const emails = list.slice(1).map(row => row[0].trim());
    return await getUsersByEmails(emails);
  }

  async function getUserByGithubUsername(githubUsername) {
    const usersRef = db.collection('users').where('githubUsername', '==', githubUsername);
    let users = await getDocuments(usersRef);
    if (users.length === 0) {
      return null;
    }
    return users[0];
  }

  async function getUserByEmail(email) {
    const usersRef = db.collection('users').where('email', '==', email);
    let users = await getDocuments(usersRef);
    if (users.length === 0) {
      return null;
    }
    return users[0];
  }

  async function getUsersByEmails(emails) {
    const usersRef = db.collection('users').where('email', 'in', emails);
    return await getDocuments(usersRef);
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

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Function to calculate the start of the current week (Monday)
  function getStartOfWeek(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday as start
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diff);
    return startOfWeek;
  }
};
