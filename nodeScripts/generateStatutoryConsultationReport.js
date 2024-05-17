'use strict';

const { app, db } = require('./shared/admin.js');
const { generateStatutoryConsultationReport } = require('../functions/actions/exercises/generateStatutoryConsultationReport')(db);

const main = async () => {
  return generateStatutoryConsultationReport('kJKbG9TOQToEzB4AlEV1');
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
