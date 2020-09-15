'use strict';

const { app, db } = require('./shared/admin.js');
const { getDocument } = require('../functions/shared/helpers');
const fs = require('fs');

const main = async () => {
  const qualifyingTest = await getDocument(db.collection('qualifyingTests').doc('2bpbIve3vKn9IJpVwUWC'));
  const outputFile = 'export.json';
  const output = JSON.stringify(qualifyingTest.testQuestions);
  fs.writeFileSync(outputFile, output, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });  
  return true;
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
