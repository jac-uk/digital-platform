
const config = require('./shared/config');
const { firebase, app, db, auth } = require('./shared/admin.js');
const { customReport } = require('../actions/exercises/customReport')(config, firebase, db);

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
