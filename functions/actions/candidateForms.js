import { applyUpdates } from '../shared/helpers.js';

export default (firebase, db) => {
  return {
    onCandidateFormCreate,
  };

  /**
   * CandidateForm created event handler
   * - Creates CandidateFormResponses
   * - One per candidate
   */
  async function createCandidateResponses(data) {
    console.log('candidateForm created');

    // {
    //   exerciseId: { id: String },
    //   task: { type: String },
    //   createdAt: Timestamp,
    //   lastUpdated: Timestamp,
    //   openDate: Timestamp,
    //   closeDate: Timestamp,
    //   candidateIds: String[],
    //   parts: String[],
    //   panellists: [{ id: String, fullName: String }],
    // }

    if (data.candidateIds.length) {
      let commands = [];

      for (let i = 0; i < data.candidateIds.length; i++) {
        const candidateFormId = data.id;
        const candidateId = candidateIds[i];
  
      // {
      //   formId: String,  // so we know ID of parent document
      //   status: String,  // e.g. created | requested | completed
      //   statusLog: {},  // e.g. { created: Timestamp, requested: Timestamp, completed: Timestamp }
      //   progress: {} // e.g. { part1: Boolean, part2: Boolean },
      //   candidateAvailability: {} // TBC
      //   panelConflicts: {} // TBC
      // }
  
        const document = {
          formId: candidateFormId,
          status: 'CREATED',  // @TODO: Use constant
          statusLog: {
            created: firebase.firestore.FieldValue.serverTimestamp(),
            requested: null,
            completed: null,
          },
          progress: {
            part1: false,   // @TODO: Check with Warren if this should be true here!!!
            part2: false,
          },
          candidateAvailability: {}, // TBC
          panelConflicts: {}, // TBC
        };

        commands.push({
          command: 'set',
          ref: db.collection('candidateFormRequests').doc(),
          data: document,
        });
      }
    }
    return await applyUpdates(db, commands);
  }
};
