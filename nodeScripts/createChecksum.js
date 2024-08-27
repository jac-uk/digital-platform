'use strict';

import config from './shared/config.js';
import { firebase, app } from './shared/admin.js';
import { createChecksumFile } from '../functions/actions/malware-scanning/createChecksum.js';
const createChecksum = createChecksumFile(config, firebase);

const fileURL = 'blank.docx';

const main = async () => {
  // Calculate checksum using the fle content
  const bucket = firebase.storage().bucket(config.STORAGE_URL);

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
