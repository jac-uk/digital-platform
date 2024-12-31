import assert from 'assert';
import { firebaseFunctionsTest, generateMockContext } from './helpers.js';
import scanFile from '../../functions/callableFunctions/scanFile.js';

const { wrap } = firebaseFunctionsTest;

describe('scanFile', () => {
  it ('Scan file except virus scanning logs file', async () => {
    const wrapped = wrap(scanFile);
    let res = null;
    res = await wrapped({ fileURL: 'https://storage.googleapis.com/upload/storage/v1/b/digital-platform-develop.appspot.com/o?uploadType=multipart&name=virusScanningLogs/2022-08-04T00:00:00.000Z.doc' }, generateMockContext());
    assert.equal(res.result, 'error');
    res = await wrapped({ fileURL: 'https://storage.googleapis.com/upload/storage/v1/b/digital-platform-develop.appspot.com/o?uploadType=multipart&name=logs/2022-08-04T00:00:00.000Z.json' }, generateMockContext());
    assert.equal(res.result, 'error');
  });
  it ('Skip virus scanning logs file', async () => {
    const wrapped = wrap(scanFile);
    const res = await wrapped({ fileURL: 'https://storage.googleapis.com/upload/storage/v1/b/digital-platform-develop.appspot.com/o?uploadType=multipart&name=virusScanningLogs/2022-08-04T00:00:00.000Z.json' }, generateMockContext());
    assert.equal(res.result, 'skip');
  });
});
