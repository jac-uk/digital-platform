import { getDocuments, dedupeArray } from '../shared/helpers.js';
import initCandidateHelper from '../shared/candidateHelper.js';
import initAuthHelper from '../shared/authHelper.js';

export default (db, auth) => {

  const  { candidateCompleted2FASinceDate } = initCandidateHelper(auth);
  const  { listAllUsers } = initAuthHelper(auth);

  return {
    getNumCandidatesCompleted2FASinceDate,
    getCandidatesCompleted2FASinceDate,
    getCandidatesSinceSignInDate,
    getIndependentAssessorsSinceSignInDate,
  };

  /**
   * Return the number of candidates who have completed 2FA since a specific date.
   * If no date is supplied then its since records began
   * @param {String} specifiedCutoffDate eg '2024-01-31'
   * @returns
   */
  async function getNumCandidatesCompleted2FASinceDate(specifiedCutoffDate = null) {
    try {
      let candidatesCompleted2FA = 0;
      const personalDetailsRefs = [];
      const candidates = await getDocuments(db.collection('candidates'));
      for (const candidate of candidates) {
        personalDetailsRefs.push(db.doc(`candidates/${candidate.id}/documents/personalDetails`));
      }

      // get personal details
      const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['twoFactorAuthVerifiedAt'] });
      personalDetailsDocs.forEach((doc) => {
        if (doc.exists) {
          const personalDetails = doc.data();
          if (personalDetails.twoFactorAuthVerifiedAt) {
            if (candidateCompleted2FASinceDate(personalDetails)) {
              ++candidatesCompleted2FA;
            }
          }
        }
      });

      return candidatesCompleted2FA;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Return the candidates who have completed 2FA since a specific date.
   * If no date is supplied then its since records began
   * @param {String} specifiedCutoffDate eg '2024-01-31'
   * @returns
   */
  async function getCandidatesCompleted2FASinceDate(specifiedCutoffDate = null) {
    try {
      let candidatesCompleted2FA = [];
      const personalDetailsRefs = [];
      const candidates = await getDocuments(db.collection('candidates'));
      for (const candidate of candidates) {
        personalDetailsRefs.push(db.doc(`candidates/${candidate.id}/documents/personalDetails`));
      }

      // get personal details
      const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['fullName', 'email', 'twoFactorAuthVerifiedAt'] });
      personalDetailsDocs.forEach((doc) => {
        if (doc.exists) {
          const personalDetails = doc.data();
          if (personalDetails.twoFactorAuthVerifiedAt) {
            if (candidateCompleted2FASinceDate(personalDetails)) {
              candidatesCompleted2FA.push([
                personalDetails.fullName,
                personalDetails.email,
                personalDetails.twoFactorAuthVerifiedAt.toDate().toISOString().split('T')[0],
              ]);
            }
          }
        }
      });

      return candidatesCompleted2FA;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
   * Return all candidates authenticated with google / microsoft (i.e. users who have attempted authentication with admin)
   * since a specific sign in date (includes the sign in date)
   * @param {String} specifiedCutoffDate eg '2024-01-01'
   * @returns
   */
  async function getCandidatesSinceSignInDate(specifiedCutoffDate) {
    let candidateUsers = [];
    try {
      // get all users
      const users = [];
      await listAllUsers(users);
      for (const user of users) {
        let isJacAdmin = false;
        const cutoffDate = new Date(specifiedCutoffDate); // Set cutoff date
        const lastSignInTime = user.metadata.lastSignInTime;
        if (lastSignInTime && new Date(lastSignInTime) >= cutoffDate) {
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

          if (!isJacAdmin) {
            // Get fullname from candidate record by email
            let fullName = '';
            let candidatesRef = db.collection('candidates')
              .where('email', '==', user.email);
            const candidates = await getDocuments(candidatesRef);
            if (candidates.length) {
              fullName = candidates[0].fullName;
              // Get formatted sign in date
              const formattedSignInDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(lastSignInTime));
              const candidateUser = [user.uid, user.email, fullName, user.displayName, formattedSignInDate];
              candidateUsers.push(candidateUser);
            }
          }
        }
      }
      return candidateUsers;
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }

  /**
     * Return all IAs authenticated with google / microsoft (i.e. users who have attempted authentication with admin)
     * since a specific sign in date (includes the sign in date)
     * @param {String} specifiedCutoffDate eg '2024-01-01'
     * @returns
     */
  async function getIndependentAssessorsSinceSignInDate(specifiedCutoffDate) {
    let assessorUsers = [];
    try {
      // get all users
      const users = [];
      await listAllUsers(users);
      for (const user of users) {
        let isJacAdmin = false;
        const cutoffDate = new Date(specifiedCutoffDate); // Set cutoff date
        const lastSignInTime = user.metadata.lastSignInTime;
        if (lastSignInTime && new Date(lastSignInTime) >= cutoffDate) {
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

          if (!isJacAdmin) {
            // Get fullname from assessment record by assessor email
            let fullName = '';
            let assessmentsRef = db.collection('assessments')
              .where('assessor.email', '==', user.email);
            const assessments = await getDocuments(assessmentsRef);
            if (assessments.length) {
              fullName = assessments[0].assessor.fullName;

              // Get formatted sign in date
              const formattedSignInDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).format(new Date(lastSignInTime));
              const assessor = [user.uid, user.email, fullName, formattedSignInDate];
              assessorUsers.push(assessor);
            }
          }
        }
      }
      // Remove duplicates
      return dedupeArray(assessorUsers, 1); // dedupe on email
    }
    catch(e) {
      console.log(e);
      return false;
    }
  }
};
