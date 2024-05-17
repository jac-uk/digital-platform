const config = require('./shared/config');
const { app, db } = require('./shared/admin');
const enableCharacterChecks = require('../functions/actions/characterChecks')(config, db);

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
