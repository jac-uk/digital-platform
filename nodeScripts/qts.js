'use strict';

import { QUALIFYING_TEST } from './shared/constants.js';
import { app } from './shared/admin.js';
import initQts from '../functions/shared/qts.js';

const qts = initQts();

const main = async () => {

  const response = await qts.post('qualifying-test', {
    folder: 'test001',
    test: {
      type: QUALIFYING_TEST.TYPE.CRITICAL_ANALYSIS,
      title: 'CA for JAC0006',
      startDate: '2022-05-17T09:00:00',
      endDate: '2022-05-18T21:00:00',
    },
  });

  return response;


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
