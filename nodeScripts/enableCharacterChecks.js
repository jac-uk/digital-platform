const config = require('./shared/config');
const { app, firebase, db } = require('./shared/admin');
const enableCharacterChecks = require('../functions/actions/characterChecks')(config, firebase, db);

const main = async () => {
  return enableCharacterChecks({
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
