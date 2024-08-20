'use strict';

import { firebase, app, db } from './shared/admin.js';
import initTargetedOutreachReport from '../functions/actions/exercises/targetedOutreachReport.js';

const { targetedOutreachReport } = initTargetedOutreachReport(firebase, db);

const main = async () => {

  //  '	 ',
  //  ' ',                  // 30
  //  'AA 123456       V',  // 0
  //  'TR768534A',          // 12
  //  'BN678987G',          // 47 
  //  'A B  1 2 3 4 5 6 C', // 32
  //  'GG010 203D',         // 0
  //  'QQ 12 34 56 C',      // 44 => 9 normalized
  //  'PP005897 C',         // 1 normalized
  //  'PP 060953 C',        // 2 normalized
  //  'PP024177C',          //1 normalized
  //  'PP024174C',          // 0
  //  'PP-012189C',         // 1 normalized
  //  'PP024177C',          // 1
  //  'PP 060953 C',        // 2 normalized

  return targetedOutreachReport([
    'TR768534V',
  ]);
};

main()
  .then((result) => {
    console.table(result);
    result;
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
