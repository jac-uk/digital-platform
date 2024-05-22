'use strict';

/**
 * Node script to test Zenhub Api to get releases
 * Documentation:
 *  - https://github.com/octokit/core.js#readme
 *  - https://github.com/settings/tokens/new?scopes=repo
 * 
 * Run with: > npm run local:nodeScript testGetGithubReleases
 */

const config = require('./shared/config');
const zenhub = require('../functions/shared/zenhub')(config);

const main = async () => {
  try {
    const data = await zenhub.getLatestReleaseForRepositories();
    console.log(data);
    process.exit(0); // Exit normally
  } catch (error) {
    console.error(error);
    process.exit(1); // Exit with an error code
  }
};

main();
