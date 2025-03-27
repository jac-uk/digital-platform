
import { app, db } from './shared/admin.js';
import initCustomReport from '../functions/actions/exercises/customReport.js';

const { customReport } = initCustomReport(db);

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
