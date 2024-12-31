import { Storage } from '@google-cloud/storage';
import pkgJson from './package.json';

/**
 * @enum {string}
 */
const BucketTypes = Object.freeze({
  unscanned: 'unscanned',
  clean: 'clean',
  quarantined: 'quarantined',
});

/** @typedef {{[key in BucketTypes]: string}} BucketDefs */

/**
 * Configuration object.
 *
 * Values are read from the JSON configuration file.
 * See {@link readAndVerifyConfig}.
 *
 * @typedef {{
 *    buckets: Array<BucketDefs>,
 *    ClamCvdMirrorBucket: string,
 *    comments?: string
 *  }} Config
 */

const storage = new Storage({
  userAgent: `cloud-solutions/${pkgJson.name}-usage-v${pkgJson.version}`,
});

/**
 * Read configuration from JSON configuration file, verify
 * and return a Config object
 *
 * @async
 * @param {string} configFile
 * @return {Promise<Config>}
 */
async function readAndVerifyConfig(configFile) {
  /** @type {Config} */
  let config;

  try {
    config = require(configFile);
    delete config.comments;
  } catch (e) {
    throw new Error(`Invalid configuration ${configFile}: ${e.message}`);
  }

  if (!config.buckets || config.buckets.length === 0) {
    throw new Error('Configuration must include at least one bucket definition.');
  }

  let success = true;
  for (const bucketDefs of config.buckets) {
    for (const bucketType in BucketTypes) {
      const bucketName = bucketDefs[bucketType];
      if (!bucketName || !(await checkBucketExists(bucketName))) {
        success = false;
        throw new Error(`Bucket ${bucketName} for type ${bucketType} does not exist or is not accessible.`);
      }
    }

    if (
      bucketDefs.unscanned === bucketDefs.clean ||
      bucketDefs.unscanned === bucketDefs.quarantined ||
      bucketDefs.clean === bucketDefs.quarantined
    ) {
      success = false;
      throw new Error('Bucket configuration contains conflicting or duplicate bucket names.');
    }
  }

  if (!(await checkBucketExists(config.ClamCvdMirrorBucket))) {
    throw new Error(`CVD mirror bucket ${config.ClamCvdMirrorBucket} does not exist or is not accessible.`);
  }
  
  console.log( success ? 'Config Successs: Buckets found' : 'config issue: Error finding Buckets');
  return config;
}

/**
 * Check that given bucket exists. Returns true on success
 *
 * @param {string} bucketName
 * @return {Promise<boolean>}
 */
async function checkBucketExists(bucketName) {
  if (!bucketName) {
    return false;
  }
  try {
    const [files] = await storage.bucket(bucketName).getFiles({ maxResults: 1, autoPaginate: false });
    return files.length > 0;
  } catch (e) {
    console.error(`Error checking bucket existence: ${e.message}`);
    return false;
  }
}

export {
  readAndVerifyConfig
 };
