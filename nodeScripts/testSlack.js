'use strict';

import config from './shared/config.js';
import initSlack from '../functions/shared/slack.js';

const slack = initSlack(config);

const main = async () => {
  return slack.post('WS Test');
};

main()
  .then((result) => {
    console.log(result);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
