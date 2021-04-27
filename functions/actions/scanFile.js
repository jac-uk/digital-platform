module.exports = (config, firebase) => {

  return {
    scanFile,
  };

  /**
   * Scan the specified file for viruses
   */
  async function scanFile(fileURL) {
    try {
      const bucket = firebase.storage().bucket(config.STORAGE_URL);
      const file = bucket.file(fileURL);
      const exists = (await file.exists())[0]; // the exists() function returns an array with a single boolean element in it

      if (exists) {
        const scanResult = await request({
          method: 'POST',
          uri: process.env.SCAN_SERVICE_URL,
          body: {
            filename: fileURL,
          },
          json: true,
        });
        return {
          result: scanResult,
        };
      } else {
        return {
          result: 'error',
          error: 'file not found',
        };
      }
    } catch (e) {
      console.error(`Error occurred while scanning file: ${fileURL}`, e);
      return false;
    }
  }

};
