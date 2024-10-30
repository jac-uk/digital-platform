import initSearch from '../search.js';
import { applyUpdates } from '../../../shared/helpers.js';

export default (config, firebase, db) => {
  const { updateCandidate } = initSearch(firebase, db);

  return onUpdate;

  /**
   * Candidate Personal Details event handler for Update
   */
  async function onUpdate(candidateId, dataBefore, dataAfter) {
    try {
        // If mobile number exists and has changed then reset the mobileVerifiedAt so it forces re-verification
        if (dataBefore.mobile && dataBefore.mobile !== dataAfter.mobile) {
          const personalDetails = db.collection('candidates').doc(candidateId).collection('documents').doc('personalDetails');
          const commands = [];
          commands.push({
            command: 'update',
            ref: personalDetails,
            data: {
              mobileVerifiedAt: null,
            },
          });
          await applyUpdates(db, commands);
        }
        
        // Update candidate document
        const result = await updateCandidate(candidateId);
        return result;
    }
    catch (err) {
      console.log('ERROR:');
      console.log(err);
      return false;
    }
  }

};
