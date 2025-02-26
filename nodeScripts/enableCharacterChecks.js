import { app, db } from './shared/admin.js';
import initCharacterChecks from '../functions/actions/characterChecks.js';

const enableCharacterChecks = initCharacterChecks(db);

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
