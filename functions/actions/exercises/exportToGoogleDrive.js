const { getDocument, getDocuments, applyUpdates, getAllDocuments, formatDate } = require('../../shared/helpers');
const applicationConverter = require('../../shared/converters/applicationConverter')();
const drive = require('../../shared/google-drive')();

module.exports = (config, firebase, db) => {

  return {
    exportToGoogleDrive,
  };

  /**
  * exportToGoogleDrive
  *
  * @param {*} `exerciseId` (required) ID of exercises to export
  */
  async function exportToGoogleDrive(driveId, rootFolderId, exerciseId) {

    const already_processed = [];

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get applications
    let applications = await getDocuments(
      db.collection('applications')
        .where('exerciseId', '==', exerciseId)
        .where('status', '==', 'applied')
    );

    if (already_processed.length) {
      applications = applications.filter(application => {
        return already_processed.indexOf(application.id) < 0;
      })
    }

    // get drive service
    await drive.login();
    drive.setDriveId(driveId);

    // get storage services
    const bucket = firebase.storage().bucket(config.STORAGE_URL);

    // for each application
    console.log('Applications: ' + applications.length);
    for (let i = 0, len = applications.length; i < len; ++i) {
      const application = applications[i];
      const applicationId = application.id;

      // create candidate folder
      const folderId = await drive.createFolder(`${application.personalDetails.fullName} ${application.referenceNumber}`, {
        parentId: rootFolderId,
      });

      // create application doc
      const htmlString = applicationConverter.getHtmlPanelPack(application, exercise);
      await drive.createFile('Application Data', {
        folderId: folderId,
        sourceType: drive.MIME_TYPE.HTML,
        sourceContent: htmlString,
        destinationType: drive.MIME_TYPE.DOCUMENT,
      });

      // transfer files
      if (application.uploadedSelfAssessment) {
        const file = bucket.file(`exercise/${exerciseId}/user/${application.userId}/${application.uploadedSelfAssessment}`);
        const exists = await file.exists();
        if (exists) {
          await drive.createFile('Self Assessment', {
            folderId: folderId,
            sourceType: drive.getMimeType(application.uploadedSelfAssessment),
            sourceContent: file.createReadStream(),
            destinationType: drive.MIME_TYPE.DOCUMENT,
          });
        }
      }

      // get first assessment
      const assessment1 = await getDocument(db.collection('assessments').doc(`${applicationId}-1`));
      if (assessment1 && assessment1.filePath) {
        let filePath = assessment1.filePath;
        if (filePath.charAt(0) === '/') {
          filePath = filePath.substr(1);
        }
        const file = bucket.file(filePath);
        const exists = await file.exists();
        if (exists) {
          await drive.createFile('Independent Assessment 1', {
            folderId: folderId,
            sourceType: drive.getMimeType(filePath),
            sourceContent: file.createReadStream(),
            destinationType: drive.MIME_TYPE.DOCUMENT,
          });
        }
      }

      // get second assessment
      const assessment2 = await getDocument(db.collection('assessments').doc(`${applicationId}-2`));
      if (assessment2 && assessment2.filePath) {
        let filePath = assessment2.filePath;
        if (filePath.charAt(0) === '/') {
          filePath = filePath.substr(1);
        }
        const file = bucket.file(filePath);
        const exists = await file.exists();
        if (exists) {
          const params = {
            folderId: folderId,
            sourceType: drive.getMimeType(filePath),
            sourceContent: file.createReadStream(),
          };
          if (params.sourceType !== drive.MIME_TYPE.PDF) {
            params.destinationType = drive.MIME_TYPE.DOCUMENT;
          }
          await drive.createFile('Independent Assessment 2', params);
        }
      }

      console.log(applicationId);

    }


  }

};
