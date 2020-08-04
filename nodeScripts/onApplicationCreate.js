'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { onApplicationCreate } = require('../functions/actions/applications/applications')(config, firebase, db);

const main = async () => {
  const ref = db.collection('applications').doc('LZxWU3IM2DsaMg7Hb1qS');
  const data = {
    exerciseRef: 'test exercise',
  };
  return onApplicationCreate(ref, data);
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
