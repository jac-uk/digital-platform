
const { app, db } = require('./shared/admin.js');
const { customReport } = require('../functions/actions/exercises/customReport')(db);

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
