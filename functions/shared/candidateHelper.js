import { objectHasNestedProperty } from './helpers.js';
export default () => {
  
  return {
    candidateCompleted2FASinceDate,
  };

  /**
   * Check if the candidate has completed 2FA after a cutoff date
   * If no date is specified then the function ignores the time constraint
   * 
   * @param {object} candidatePersonalDetails
   * @param {string} specifiedCutoffDate
   * @returns 
   */
  function candidateCompleted2FASinceDate(candidatePersonalDetails, specifiedCutoffDate = null) {
     return (
      objectHasNestedProperty(candidatePersonalDetails, twoFactorAuthVerifiedAt)
      && (!specifiedCutoffDate || (candidatePersonalDetails.twoFactorAuthVerifiedAt.toDate() >= new Date(specifiedCutoffDate))));
  }
};


