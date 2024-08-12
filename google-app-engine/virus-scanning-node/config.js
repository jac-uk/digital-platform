const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { logger } = require('./logger.js');
const pkgJson = require('./package.json');

const BucketTypes = Object.freeze({
  unscanned: 'unscanned',
  clean: 'clean',
  quarantined: 'quarantined',
});

const storage = new Storage({
  userAgent: `cloud-solutions/${pkgJson.name}-usage-v${pkgJson.version}`,
});

async function readAndVerifyConfig(configFile) {
  logger.info(`Using configuration file: ${configFile}`);

  let config;

  try {
    const configPath = path.resolve(__dirname, configFile);
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.comments) delete config.comments;
  } catch (e) {
    logger.fatal({ err: e }, `Unable to read JSON file from ${configFile}`);
    throw new Error(`Invalid configuration ${configFile}`);
  }

  if (config.buckets.length === 0) {
    logger.fatal(`No buckets configured for scanning in ${configFile}`);
    throw new Error('No buckets configured');
  }

  logger.info('BUCKET_CONFIG: ' + JSON.stringify(config, null, 2));

  let success = true;
  for (let x = 0; x < config.buckets.length; x++) {
    const bucketDefs = config.buckets[x];
    for (const bucketType in BucketTypes) {
      if (!(await checkBucketExists(bucketDefs[bucketType], `config.buckets[${x}].${bucketType}`))) {
        success = false;
      }
    }
    if (bucketDefs.unscanned === bucketDefs.clean || bucketDefs.unscanned === bucketDefs.quarantined || bucketDefs.clean === bucketDefs.quarantined) {
      logger.fatal(`Error in ${configFile} buckets[${x}]: bucket names are not unique`);
      success = false;
    }
  }
  if (!(await checkBucketExists(config.ClamCvdMirrorBucket, 'ClamCvdMirrorBucket'))) {
    success = false;
  }

  if (!success) {
    throw new Error('Invalid configuration');
  }
  return config;
}

async function checkBucketExists(bucketName, configName) {
  if (!bucketName) {
    logger.fatal(`Error in config: no "${configName}" bucket defined`);
    return false;
  }
  try {
    await storage.bucket(bucketName).getFiles({ maxResults: 1, prefix: 'zzz', autoPaginate: false });
    return true;
  } catch (e) {
    logger.fatal(`Error in config: cannot view files in "${configName}" : ${bucketName} : ${e}`);
    logger.debug({ err: e });
    return false;
  }
}

module.exports = { readAndVerifyConfig };
