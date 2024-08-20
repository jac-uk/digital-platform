
/**
 * Print html output for the panel pack.
 * The working preferences questions have v1 and v2 versions which can only be discerned by the structure of their data
 * and need processing in a separate way.
 *
 * EXAMPLE USAGE:
 *   ```
 *   npm run applicationConverter.getHtmlPanelPack
 *   ```
 */

'use strict';

import { getDocument } from '../functions/shared/helpers.js';
import { app, db } from './shared/admin.js';
import initApplicationConverter from '../functions/shared/converters/applicationConverter.js';

const { getHtmlPanelPack } = initApplicationConverter();

const main = async () => {

    // Self Assessment Questions
    // Develop
    const exerciseId = 'IUSNh8uyhmM3u4x7F8eC';
    const applicationId = 'tomtom111';

    // Version 2 Questions
    // Develop
    // const exerciseId = 'AQJcLG2HtXyLkGVLQQjp';
    //const applicationId = 'fErVaoQBu8AO7lDN4nb3';
    // const applicationId = 'KW9O5qQJSUsKiOnyXQbJ';

    
    // Version 1 Questions
    // Develop

    // Single choice
    // const exerciseId = 'vzReRrA5LPZ3sGvZKWvM';
    // const applicationId = 'O9skYldYMlGBhheSNzzz';

    // const exerciseId = '11bv7ZTyyKhoqGYAPN7Y';
    // const applicationId = 'y424cxaFtmLq2IAvr4cL';

    // Multiple choice
    // const exerciseId = 'NebJYlQl4fxnUXWmrWOa';
    // const applicationId = 'artTntRl4iY5zmZbk8df';
    // const exerciseId = '2M7yxJySfXpINFwvhnnW';
    // const applicationId = 'F7YnJ1BhMGVF88DCqNFi';

    // // Ranked choice
    // const exerciseId = '9JP3KOJHxrKyj2VLDiTG';
    // const applicationId = 'gBehZXTxPRxEcwWFcV9a';
    // const exerciseId = 'lQTFoAw40KrX4vQ6xtG1';
    // const applicationId = '7jYmkADdcmiJ6VHlWvKB';
    
    // All V1 Choices
    // const exerciseId = 'lQTFoAw40KrX4vQ6xtG1';
    // const applicationId = '7jYmkADdcmiJ6VHlWvKB';

    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    if (!exercise) return 'no exercise';
    
    const application = await getDocument(db.collection('applications').doc(applicationId));
    if (!application) return 'no application';

    //await getHtmlPanelPack(application, exercise);
    const htmlOutput = await getHtmlPanelPack(application, exercise);
    console.log(htmlOutput);
};

main()
  .then((result) => {
    console.log('Result', result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
