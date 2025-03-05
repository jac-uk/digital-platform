'use strict';

import { firebase, app } from './shared/admin.js';
import createChecksum from '../functions/actions/malware-scanning/createChecksum.js';

const fileURL = 'blank.docx';

const main = async () => {
  // Calculate checksum using the fle content
  const bucket = firebase.storage().bucket(process.env.STORAGE_URL);

  const file = bucket.file(fileURL);
  const [fileContent] = await file.download();

  return createChecksum(fileContent);
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
