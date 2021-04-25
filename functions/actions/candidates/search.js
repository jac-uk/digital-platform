/**
 * Candidate search module
 * A set of methods to help keep candidate search & relationships data up to date
 */

const { getDocument, getDocuments, applyUpdates } = require('../../shared/helpers');

module.exports = (db) => {
  return {
    updateAllCandidates,
    updateCandidate,
  };

  /**
   * Update candidate document with full search & relationships data
   * @returns boolean (true => success)
   */
  async function updateCandidate(candidateId) {
    const qtyUpdated = await updateAllCandidates(candidateId);
    return qtyUpdated !== false;
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
      candidates.push(candidate);
    } else {
      candidates = await getDocuments(db.collection('candidates').orderBy('created'));
    }
    for (let i = 0, len = candidates.length; i < len; ++i) {
      candidateData[candidates[i].id] = {};
      personalDetailsRefs.push(db.doc(`candidates/${candidates[i].id}/documents/personalDetails`));
    }

    // get personal details
    const personalDetailsDocs = await db.getAll(...personalDetailsRefs, { fieldMask: ['firstName', 'lastName', 'fullName', 'email', 'nationalInsuranceNumber'] });
    personalDetailsDocs.forEach((doc) => {
      let candidateId = doc.ref.path.replace('candidates/', '').replace('/documents/personalDetails', '');
      if (doc.exists) {
        const personalDetails = doc.data();
        if (personalDetails.firstName && personalDetails.lastName) {
          candidateData[candidateId].fullName = `${personalDetails.firstName} ${personalDetails.lastName}`;
        } else {
          candidateData[candidateId].fullName = personalDetails.fullName;
        }
        candidateData[candidateId].email = personalDetails.email;
        candidateData[candidateId].nationalInsuranceNumber = personalDetails.nationalInsuranceNumber;
      } else {
        candidateData[candidateId].fullName = '';
        candidateData[candidateId].email = '';
        candidateData[candidateId].nationalInsuranceNumber = '';
      }
    });

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
        exercisesMap[application.exerciseId] = application.status;
        applicationsMap[application.id] = application.status;
        if (application.referenceNumber) { referenceNumbers.push(application.referenceNumber); }
      });
      candidateData[candidates[i].id].exercisesMap = exercisesMap;
      candidateData[candidates[i].id].applicationsMap = applicationsMap;
      candidateData[candidates[i].id].referenceNumbers = referenceNumbers;
    }

    // construct update commands
    const commands = [];
    for (let i = 0, len = candidates.length; i < len; ++i) {
      const search = [];
      search.push(candidateData[candidates[i].id].email);
      search.push(candidateData[candidates[i].id].nationalInsuranceNumber);
      // split full name into words
      const words = candidateData[candidates[i].id].fullName.toLowerCase().split(' ');
      for (let j = 0, lenJ = words.length; j < lenJ; ++j) {
        // add letters from word
        for (let k = 0, lenK = words[j].length; k < lenK; ++k) {
          const letters = words[j].substr(0, k + 1);
          search.push(letters);
          if (j > 0) {
            for (let l = j - 1; l >= 0; --l) {
              search.push(`${words[l]} ${letters}`);
            }
          }
        }
        // add previous word with space
        if (j > 0) {
          search.push(`${words[j - 1]} `);
        }
      }
      // add reference numbers to search
      for (let j = 0, lenJ = candidateData[candidates[i].id].referenceNumbers.length; j < lenJ; ++j) {
        let referenceNumber = candidateData[candidates[i].id].referenceNumbers[j];
        if (referenceNumber) {
          referenceNumber = referenceNumber.split('-')[1];
          for (let k = 0, lenK = referenceNumber.length; k < lenK; ++k) {
            search.push(referenceNumber.substr(0, k + 1));
            if (k > 0) { search.push(referenceNumber.substr(k, lenK)); }
          }
        }
      }

      commands.push({
        command: 'update',
        ref: db.collection('candidates').doc(candidates[i].id),
        data: {
          fullName: candidateData[candidates[i].id].fullName,
          email: candidateData[candidates[i].id].email.toLowerCase(),
          computed: {
            search: search,
            exercisesMap: candidateData[candidates[i].id].exercisesMap,
            applicationsMap: candidateData[candidates[i].id].applicationsMap,
            referenceNumbers: candidateData[candidates[i].id].referenceNumbers,
            totalApplications: Object.keys(candidateData[candidates[i].id].applicationsMap).length,
          },
        },
      });
    }

    // write to db
    const result = await applyUpdates(db, commands);
    return result ? candidates.length : false;

  }

};
