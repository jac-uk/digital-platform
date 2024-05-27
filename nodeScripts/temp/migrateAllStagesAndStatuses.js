
/**
 * Migrate all live exercises to `_processingVersion` 2. This updates all `applicationRecords` for each exercise
 */
'use strict';

const config = require('../shared/config.js');
const { firebase, app, db } = require('../shared/admin.js');
const { getDocuments } = require('../../functions/shared/helpers.js');
const { updateApplicationRecordStageStatus } = require('../../functions/actions/applicationRecords/updateApplicationRecordStageStatus.js')(firebase, config, db);
const { generateDiversityReport } = require('../../functions/actions/exercises/generateDiversityReport')(config, firebase, db);
const { generateDiversityData } = require('../../functions/actions/exercises/generateDiversityData')(firebase, db);
const { generateOutreachReport } = require('../../functions/actions/exercises/generateOutreachReport')(config, firebase, db);

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
