const { getDocument, getDocuments } = require('../../shared/helpers');
const applicationConverter = require('../../shared/converters/applicationConverter')();
const qtConverter = require('../../shared/converters/qtConverter')();
const drive = require('../../shared/google-drive')();

module.exports = (config, firebase, db) => {

  return {
    processPanelExport,
  };

  /**
  * processPanelExport
  *
  * @param {*} `panelId` (required) ID of panel to process
  */
  async function processPanelExport(panelId) {

    // get panel
    // TODO we can pass in panel document
    const panel = await getDocument(db.collection('panels').doc(panelId));
    if (panel.status !== 'processing') {
      return false;
    }

    // get exercise
    // TODO store `application-parts` rather than needing to grab exercise document
    const exercise = await getDocument(db.collection('exercises').doc(panel.exerciseId));

    // get application to process
    const application = await getDocument(db.collection('applications').doc(panel.processing.current));
    if (!application) {
      return false;
      // TODO mark as error and move on to next application
    }

    if (application) {
      // get drive service
      await drive.login();
      drive.setDriveId(panel.drive.driveId);

      // get storage service
      const bucket = firebase.storage().bucket(config.STORAGE_URL);
      // console.log('bucket', bucket);

      // show candidate name
      const showNames = panel.type !== 'sift';

      // create application folder
      let applicationFolderName;
      if (showNames) {
        applicationFolderName = `${application.personalDetails.fullName} ${application.referenceNumber}`;
      } else {
        applicationFolderName = application.referenceNumber.replace(`${exercise.referenceNumber}-`, '');
        // TODO need to account for sifts that are NOT name-blind (i.e. where we do want to include candidate name, as above)
        // We could look at `exercise.shortlistingMethods` to see whether sift or name-blind-sift was selected however user can currently select both of these which might need simplifying
        // (plus the default should be name-blind)
      }
      const folderId = await drive.createFolder(applicationFolderName, {
        parentId: panel.drive.folderId,
      });

      const promises = [];

      if (panel.type === 'selection' || panel.type === 'sift') {
        // Create application data document
        promises.push(
          drive.createFile('Application Data', {
            folderId: folderId,
            sourceType: drive.MIME_TYPE.HTML,
            sourceContent: applicationConverter.getHtmlPanelPack(application, exercise, { showNames }),
            destinationType: drive.MIME_TYPE.DOCUMENT,
          }).catch(e => 'Error: Application Data')
        );

        // Transfer Self Assessment
        if (application.uploadedSelfAssessment) {
          promises.push(
            transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${panel.exerciseId}/user/${application.userId}/${application.uploadedSelfAssessment}`,
              destinationFolderId: folderId,
              destinationFileName: 'Self Assessment',
            }).catch(e => {
              console.log(e);
              return 'Error: Self Assessment';
            })
          );
        }

        // Transfer Covering Letter
        if (application.uploadedCoveringLetter) {
          promises.push(
            transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${panel.exerciseId}/user/${application.userId}/${application.uploadedCoveringLetter}`,
              destinationFolderId: folderId,
              destinationFileName: 'Covering Letter',
            }).catch(e => 'Error: Covering Letter')
          );
        }

        // Transfer CVs
        if (application.uploadedCV) {
          promises.push(
            transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${panel.exerciseId}/user/${application.userId}/${application.uploadedCV}`,
              destinationFolderId: folderId,
              destinationFileName: 'CV',
            }).catch(e => 'Error: CV')
          );
        }

        // Transfer Statement of Suitability
        if (application.uploadedSuitabilityStatement) {
          promises.push(
            transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${panel.exerciseId}/user/${application.userId}/${application.uploadedSuitabilityStatement}`,
              destinationFolderId: folderId,
              destinationFileName: 'Statement of Suitability',
            }).catch(e => 'Error: Statement of Suitability')
          );
        }

        // First independent assessment
        promises.push(
          getDocument(db.collection('assessments').doc(`${application.id}-1`)).then(assessment => {
            if (assessment && assessment.filePath) {
              let filePath = assessment.filePath;
              if (filePath.charAt(0) === '/') {
                filePath = filePath.substr(1);
              }
              return transferFileFromStorage({
                storageBucket: bucket,
                fileUrl: filePath,
                destinationFolderId: folderId,
                destinationFileName: 'Independent Assessment 1',
              });
            }
            return '';
          }).catch(e => 'Error: Independent Assessment 1')
        );

        // Second independent assessment
        promises.push(
          getDocument(db.collection('assessments').doc(`${application.id}-2`)).then(assessment => {
            if (assessment && assessment.filePath) {
              let filePath = assessment.filePath;
              if (filePath.charAt(0) === '/') {
                filePath = filePath.substr(1);
              }
              return transferFileFromStorage({
                storageBucket: bucket,
                fileUrl: filePath,
                destinationFolderId: folderId,
                destinationFileName: 'Independent Assessment 2',
              });
            }
            return '';
          }).catch(e => 'Error: Independent Assessment 2')
        );
      } else if (panel.type === 'scenario') {
        let qTests = await getDocuments(db.collection('qualifyingTests').where('vacancy.id', '==', panel.exerciseId));
        qTests = qTests.map(qTest => qTest.id);
        console.log('qualifying tests: ', JSON.stringify(qTests));
        const qtResponses = await getDocuments(db.collection('qualifyingTestResponses').where('candidate.id', '==', application.userId)
          .where('qualifyingTest.id', 'in', qTests));
        console.log('qt responses: ', JSON.stringify(qtResponses));
        qtResponses.forEach((qtResponse, idx) => {
          promises.push(
            drive.createFile(qtResponse.qualifyingTest.title, {
              folderId: folderId,
              sourceType: drive.MIME_TYPE.HTML,
              sourceContent: qtConverter.getHtmlQualifyingTestResponse(qtResponse, exercise, application,{ showNames }),
              destinationType: drive.MIME_TYPE.DOCUMENT,
            }).catch(e => `Error: QT Response ${idx + 1}`)
          );
        });
        if (!qtResponses.length) {
          promises.push(
            drive.deleteFolder(folderId) //If the candiate hasn't taken the test, delete their folder.
          );
        }
      }

      // Get fileIds & errors
      const fileIds = [];
      const errorMessages = [];
      try {
        const responses = await Promise.all(promises);
        responses.forEach(response => {
          if (response.indexOf('Error') > 0) {
            errorMessages.push(response);
          } else if (response) {
            fileIds.push(response);
          }
        });
      } catch(e) {
        console.log(`Error: ${e}`);
      }

      // Update panel and move to next application (or finish)
      const data = {
        processing: { ...panel.processing },
      };
      data[`applicationsMap.${application.id}.folderId`] = folderId;
      data[`applicationsMap.${application.id}.fileIds`] = fileIds;
      data[`applicationsMap.${application.id}.errors`] = errorMessages;
      if (errorMessages.length) {
        data.processing.errors = firebase.firestore.FieldValue.arrayUnion(application.id);
      }
      if (panel.processing.queue.length > 0) {
        data.processing.current = data.processing.queue.shift();
      } else {
        data.status = 'created';
        data['statusLog.created'] = firebase.firestore.FieldValue.serverTimestamp();
        data.processing = null;
      }
      await panel.ref.update(data);

    }

    return true;

  }

  async function transferFileFromStorage({ storageBucket, fileUrl, destinationFolderId, destinationFileName }) {
    if (fileUrl) {
      const file = storageBucket.file(fileUrl);
      const exists = await file.exists();
      if (exists) {
        const fileId = await drive.createFile(destinationFileName, {
          folderId: destinationFolderId,
          sourceType: drive.getMimeType(fileUrl),
          sourceContent: file.createReadStream(),
          destinationType: drive.MIME_TYPE.DOCUMENT,
        });
        return fileId;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

};
