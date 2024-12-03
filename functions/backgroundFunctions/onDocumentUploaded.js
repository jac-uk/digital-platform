import functions from 'firebase-functions';
import config from '../shared/config.js';
import { firebase } from '../shared/admin.js';
import scanFileInit from '../actions/malware-scanning/scanFile.js';

const scanFile = scanFileInit(config, firebase);

export default functions.region('europe-west2').storage
  .object()
  .onFinalize(async (object) => {
    // console.log('object', JSON.stringify(object));
    return scanFile(object.name); // file path in the bucket
  });
