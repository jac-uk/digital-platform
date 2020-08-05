'use strict';

const config = require('./shared/config');
const slack = require('../functions/shared/slack')(config);

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
