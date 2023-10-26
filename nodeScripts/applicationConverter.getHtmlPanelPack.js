
/**
 * Example local script
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript example.js
 *   ```
 */
'use strict';

// const config = require('./shared/config');
const { getDocument } = require('../functions/shared/helpers');
const { app, db } = require('./shared/admin.js');
const { getHtmlPanelPack } = require('../functions/shared/converters/applicationConverter')();

const main = async () => {
    const exerciseId = 'HdvJaVf4QIpGTDJDmeYz';
    const applicationId = '9i19zY8rtCBLB2O4H3pe';

    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    if (!exercise) return 'no exercise';
    
    const application = await getDocument(db.collection('applications').doc(applicationId));
    if (!application) return 'no application';

    await getHtmlPanelPack(application, exercise);
};

main()
  .then((result) => {
    console.log('Result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
