'use strict';

const config = require('./shared/config');
const { app } = require('./shared/admin.js');
const { extractDocumentContent } = require('../functions/shared/file-extraction/extractDocumentContent')(config, firebase);

const main = async () => {
  return extractDocumentContent('exercise/0CgDWjU5Iap9wxBqECZD/candidate-assessement-forms_0.docx','exercise/0CgDWjU5Iap9wxBqECZD/candidate-assessement-forms_filled.docx');
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
