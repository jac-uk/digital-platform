import { getDocuments } from '../shared/helpers.js';

export default (db, auth) => {

  return {
    getNumCandidatesCompleted2FASinceDate,
    getCandidatesCompleted2FASinceDate,
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
            if (!specifiedCutoffDate || (personalDetails.twoFactorAuthVerifiedAt.toDate() >= new Date(specifiedCutoffDate))) {
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
            if (!specifiedCutoffDate || (personalDetails.twoFactorAuthVerifiedAt.toDate() >= new Date(specifiedCutoffDate))) {
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
};
