'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { processPanelExport } = require('../functions/actions/panels/processPanelExport')(config, firebase, db);

const main = async () => {

  const panelId = 'X2dCy2p4pVSf8gsQZjOh';

  console.log('started', new Date());
  try {
    await processPanelExport(panelId);
  } catch (e) {
    console.log('error:::', e);
  }
  console.log('finished', new Date());

  return true;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });


