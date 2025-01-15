'use strict';

import { firebase, app, db } from './shared/admin.js';
import initGenerateStatutoryConsultationReport from '../functions/actions/exercises/generateStatutoryConsultationReport.js';

const { generateStatutoryConsultationReport } = initGenerateStatutoryConsultationReport(firebase, db);

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
