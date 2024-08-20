
import config from './shared/config.js';
import { firebase, app, db } from './shared/admin.js';
import initCustomReport from '../functions/actions/exercises/customReport.js';

const { customReport } = initCustomReport(config, firebase, db);

const main = async (params) => {
  await customReport({
    name: params.name,
    columns: params.columns,
    whereClauses: params.whereClauses,
  });
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
