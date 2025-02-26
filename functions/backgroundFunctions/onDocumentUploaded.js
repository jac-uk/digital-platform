import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { firebase } from '../shared/admin.js';
import scanFileInit from '../actions/malware-scanning/scanFile.js';

const scanFile = scanFileInit(firebase);

export default onObjectFinalized(async (event) => {
  // const fileBucket = event.data.bucket; // Storage bucket containing the file.
  // const filePath = event.data.name; // File path in the bucket.
  // const contentType = event.data.contentType; // File content type.
    return scanFile(event.data.name);
});
