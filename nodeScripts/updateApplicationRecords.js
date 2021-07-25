const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin');
const updateApplicationRecords = require('../functions/actions/applicationRecords/updateApplicationRecords')(config, firebase, db);

const main = async () => {
  return updateApplicationRecords({
    exerciseId: '',
  });
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
