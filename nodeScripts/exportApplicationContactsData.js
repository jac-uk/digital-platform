'use strict';

const { firebase, app, db } = require('./shared/admin.js');
const { exportApplicationContactsData } = require('../functions/actions/exercises/exportApplicationContactsData.js')(firebase, db);
const main = async () => {
  return exportApplicationContactsData('rxqeJzA9WjZ21dEXf03p','applied');
};

main()
  .then((result) => {
    console.log(result.headers);
    console.log(result.rows[0]);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
