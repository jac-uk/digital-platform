
/**
 * Migrate all live exercises to `_processingVersion` 2. This updates all `applicationRecords` for each exercise
 */
'use strict';

import config from '../shared/config.js';
import { firebase, app, db } from '../shared/admin.js';
import { getDocuments } from '../../functions/shared/helpers.js';
import initUpdateApplicationRecordStageStatus from '../../functions/actions/applicationRecords/updateApplicationRecordStageStatus.js';
import initGenerateDiversityReport from '../../functions/actions/exercises/generateDiversityReport.js';
import initGenerateDiversityData from '../../functions/actions/exercises/generateDiversityData.js';
import initGenerateOutreachReport from '../../functions/actions/exercises/generateOutreachReport.js';

const { updateApplicationRecordStageStatus } = initUpdateApplicationRecordStageStatus(firebase, config, db);
const { generateDiversityReport } = initGenerateDiversityReport(config, firebase, db);
const { generateDiversityData } = initGenerateDiversityData(firebase, db);
const { generateOutreachReport } = initGenerateOutreachReport(config, firebase, db);

const main = async () => {
  
  // get all relevant exercises
  const exercises = await getDocuments(db.collection('exercises').where('state', 'not-in', ['archived', 'deleted']));

  console.log('exercises', exercises.length);

  const NEW_VERSION = 2;

  // for each exercise run the migration and update the exercise document with new version number
  for (let i = 0, len = exercises.length; i < len; ++i) {
    if (exercises[i]._processingVersion === NEW_VERSION) continue;
    try {
      console.log('Update exercise', exercises[i].id);
      const result = await updateApplicationRecordStageStatus({
        exerciseId: exercises[i].id,
        version: NEW_VERSION,
      });
      console.log('result', result);
      await generateDiversityReport(exercises[i].id);
      await generateDiversityData(exercises[i].id);
      await generateOutreachReport(exercises[i].id);
      await exercises[i].ref.update({ _processingVersion: NEW_VERSION });
  
    } catch (e) {
      console.log('error', e);
    }  
  }

};

main()
  .then(() => {
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
