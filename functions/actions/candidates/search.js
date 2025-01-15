/**
 * Candidate search module
 * A set of methods to help keep candidate search & relationships data up to date
 */

import { getDocument, getDocuments, applyUpdates, normaliseNIN } from '../../shared/helpers.js';
import { getSearchMap } from '../../shared/search.js';

export default (firebase, db) => {
  return {
    updateAllCandidates,
    updateCandidate,
  };

  /**
   * Update candidate document with full search & relationships data
   * @returns number|false (number > 0 => success)
   */
  async function updateCandidate(candidateId) {
    if (!candidateId) { return false; }
    const qtyUpdated = await updateAllCandidates(candidateId);
    return qtyUpdated || false;
  }

  /**
   * Update all candidate documents with full search & relationships data
   * @returns Number of candidates updated or false if none
   */
  async function updateAllCandidates(candidateId) {
    // get candidate(s)
    const candidateData = {};
    const personalDetailsRefs = [];
    let candidates = [];
    if (candidateId) {
      const candidate = await getDocument(db.collection('candidates').doc(candidateId));
      if (candidate) {
        candidates.push(candidate);
      }
    } else {
      candidates = await getDocuments(db.collection('candidates').select());
    }
    for (let i = 0, len = candidates.length; i < len; ++i) {
      candidateData[candidates[i].id] = {};
      personalDetailsRefs.push(db.doc(`candidates/${candidates[i].id}/documents/personalDetails`));
    }

    // get personal details
    const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['firstName', 'lastName', 'fullName', 'email', 'nationalInsuranceNumber'] });
    personalDetailsDocs.forEach((doc) => {
      let candidateId = doc.ref.path.replace('candidates/', '').replace('/documents/personalDetails', '');
      candidateData[candidateId].fullName = '';
      candidateData[candidateId].email = '';
      candidateData[candidateId].nationalInsuranceNumber = '';
      if (doc.exists) {
        const personalDetails = doc.data();
        if (personalDetails.firstName && personalDetails.lastName) {
          candidateData[candidateId].fullName = `${personalDetails.firstName} ${personalDetails.lastName}`;
        } else {
          candidateData[candidateId].fullName = personalDetails.fullName || '';
        }
        candidateData[candidateId].email = personalDetails.email || '';
        candidateData[candidateId].nationalInsuranceNumber = normaliseNIN(personalDetails.nationalInsuranceNumber) || '';
      }
    });

    // construct update commands
    const commands = [];

    // get applications
    for (let i = 0, len = candidates.length; i < len; ++i) {
      const applications = await getDocuments(
        db.collection('applications')
          .where('userId', '==', candidates[i].id)
          .select('exerciseId', 'referenceNumber', 'status')
      );
      const exercisesMap = {};
      const applicationsMap = {};
      const referenceNumbers = [];
      applications.forEach(application => {
        exercisesMap[application.exerciseId] = application.status ? application.status : 'draft';
        applicationsMap[application.id] = application.status ? application.status : 'draft';
        if (application.referenceNumber) { referenceNumbers.push(application.referenceNumber); }
      });
      candidateData[candidates[i].id].exercisesMap = exercisesMap;
      candidateData[candidates[i].id].applicationsMap = applicationsMap;
      candidateData[candidates[i].id].referenceNumbers = referenceNumbers;

      let searchable = [
        candidateData[candidates[i].id].nationalInsuranceNumber,
        candidateData[candidates[i].id].fullName,
        candidateData[candidates[i].id].email,
      ];

      // Check if reference numbers exist
      if (referenceNumbers.length > 0) {
        searchable.push(...referenceNumbers);
      }

      commands.push({
        command: 'update',
        ref: db.collection('candidates').doc(candidates[i].id),
        data: {
          _search: getSearchMap(searchable),
          fullName: candidateData[candidates[i].id].fullName,
          email: candidateData[candidates[i].id].email.toLowerCase(),
          computed: {
            nino: candidateData[candidates[i].id].nationalInsuranceNumber,
            exercisesMap: candidateData[candidates[i].id].exercisesMap,
            applicationsMap: candidateData[candidates[i].id].applicationsMap,
            referenceNumbers: candidateData[candidates[i].id].referenceNumbers,
            totalApplications: Object.keys(candidateData[candidates[i].id].applicationsMap).length,
          },
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? candidates.length : false;

  }

};
