'use strict';

/**
 * Node script to test Zenhub Api to get releases
 * Documentation:
 *  - https://github.com/settings/tokens/new?scopes=repo
 *
 * Run with: > npm run local:nodeScript testGetGithubReleases
 */

import initZenhub from '../functions/shared/zenhub.js';

const zenhub = initZenhub();

const main = async () => {
  try {
    const data = await zenhub.getLatestReleaseForRepositories();
    console.log(data);
    process.exit(0); // Exit normally
  } catch (error) {
    console.error(error.message);
    process.exit(1); // Exit with an error code
  }
};

main();
