'use strict';

import config from './shared/config.js';
import { firebase, app } from './shared/admin.js';
import initExtractDocumentContent from '../functions/shared/file-extraction/extractDocumentContent.js';

const { extractDocumentContent } = initExtractDocumentContent(config, firebase);

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
