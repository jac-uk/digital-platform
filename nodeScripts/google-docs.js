'use strict';

const { app, db } = require('./shared/admin.js');
const { getDocument } = require('../functions/shared/helpers');
const applicationConverter = require('../functions/shared/converters/applicationConverter')();
const drive = require('../functions/shared/google-drive')();

const main = async () =>
{
  const driveId = '0AHs0fIN6F04CUk9PVA';
  const folderId = '1_Dy3YeKBvaflReY5Cifqt6_lJcoeYBPT';
  const applicationId = 'dVopiVvVJoCCBTNOjrT4';
  const exerciseId = 'Gzi2qUtL39ZEKP7yaJ58';
  const fileName = 'application-test';

  const application = await getDocument(db.collection('applications').doc(applicationId));
  const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

  

  const htmlString = applicationConverter.getHtmlPanelPack(application, exercise);
  await drive.login();
  drive.setDriveId(driveId);
  await drive.createFile(fileName, {
    folderId: folderId,
    sourceType: drive.MIME_TYPE.HTML,
    sourceContent: htmlString,
    destinationType: drive.MIME_TYPE.DOCUMENT,
  });
  return true;
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
