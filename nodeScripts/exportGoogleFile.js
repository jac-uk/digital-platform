/**
 * This script exports a file from Google Drive to a base64 string.
 * 
 */

'use strict';

import { app } from './shared/admin.js';
import { google } from 'googleapis';

const main = async (fileId, mimeType) => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.export({
    fileId,
    mimeType,
  }, {
    responseType: 'arraybuffer',
  });
  
  return Buffer.from(res.data).toString('base64');
};

main('1_Q8KGOTjZ6WaWDqKVeXWTwTOECFD9v7b1OU2jXSbsY4', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
