const { getDocument, getDocuments, applyUpdates, getAllDocuments, formatDate } = require('../../shared/helpers');
const applicationConverter = require('../../shared/converters/applicationConverter')();
const drive = require('../../shared/google-drive')();
const Bottleneck = require('bottleneck');

module.exports = (config, firebase, db) => {

  return {
    exportToGoogleDrive,
  };

  /**
  * exportToGoogleDrive
  *
  * @param {*} `exerciseId` (required) ID of exercises to export
  */
  async function exportToGoogleDrive(driveId, rootFolderId, exerciseId, panelId, excludedApplicationIds) {

    // get exercise
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    // get panel
    const panel = await getDocument(db.collection('panels').doc(panelId));

    //show candidate name
    const showNames = panel.type === 'selection';

    // get drive service
    await drive.login();
    drive.setDriveId(driveId);
    console.log('logged in to drive', new Date());

    // remove previous files
    // if (panel.status === 'created') {
    //   const promises = [];
    //   if (panel.applicationFiles) {
    //     Object.keys(panel.applicationFiles).forEach(async (applicationId) => {
    //       const folderId = panel.applicationFiles[applicationId].folderId;
    //       const fileIds = panel.applicationFiles[applicationId].fileIds;
    //       fileIds.forEach(async (fileId) => {
    //         promises.push(drive.deleteFile(fileId))
    //       });
    //       promises.push(drive.deleteFolder(folderId));
    //     });
    //   }
    //   if (panel.folderId) {
    //     promises.push(drive.deleteFolder(panel.folderId));
    //   }
    //   await Promise.all(promises);
    // }

    // get application records
    let applicationRecords = await getDocuments(
      db.collection('applicationRecords')
        .where('exercise.id', '==', exerciseId)
        .where(`panelIds.${panel.type}`, '==', panelId)
        .select()
        //.limit(50)
    );
    if (excludedApplicationIds && excludedApplicationIds.length) {
      applicationRecords = applicationRecords.filter(applicationRecord => {
        return excludedApplicationIds.indexOf(applicationRecord.id) < 0;
      });
    }

    // get applications
    const applications = await getAllDocuments(db, applicationRecords.map(item => db.collection('applications').doc(item.id)));
    console.log('got applications data', new Date());
    console.log('applications', applications.length);

    if (applications.length) {
      // create panel folder
      let panelFolderId = await drive.createFolder(`${panel.name}`, {
        parentId: rootFolderId,
      });

      // // create candidates sub-folder
      // let parentFolderId = await drive.createFolder('_candidates', {
      //   parentId: parentFolderId,
      // });
      let parentFolderId = panelFolderId;

      // get storage services
      const bucket = firebase.storage().bucket(config.STORAGE_URL);

      // create candidate application folders
      const folderIds = await Promise.all(
        applications.map(application => {
          return drive.createFolder(`${application.personalDetails.fullName} ${application.referenceNumber}`, {
            parentId: parentFolderId,
          });
        })
      );
      console.log('folders created', new Date());

      // store map of folders & files
      const applicationFiles = {};
      applications.forEach((application, index) => {
        applicationFiles[application.id] = {
          folderId: folderIds[index],
          fileIds: [],
        };
      });

      // create application google docs
      const docIds = await Promise.all(
        applications.map(application => {
          const htmlString = applicationConverter.getHtmlPanelPack(application, exercise, { showNames });
          return drive.createFile('Application Data', {
            folderId: applicationFiles[application.id].folderId,
            sourceType: drive.MIME_TYPE.HTML,
            sourceContent: htmlString,
            destinationType: drive.MIME_TYPE.DOCUMENT,
          });
        })
      );
      console.log('application docs created', new Date());

      // Transfer Self Assessments
      const assessmentIds = await Promise.all(
        applications.map(application => {
          if (application.uploadedSelfAssessment) {
            return transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${exerciseId}/user/${application.userId}/${application.uploadedSelfAssessment}`,
              destinationFolderId: applicationFiles[application.id].folderId,
              destinationFileName: 'Self Assessment',
            });
          }
          return false;
        })
      );
      console.log('Self Assessments transfered', new Date());

      // Transfer Covering Letters
      const coveringLetterIds = await Promise.all(
        applications.map(application => {
          if (application.uploadedCoveringLetter) {
            return transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${exerciseId}/user/${application.userId}/${application.uploadedCoveringLetter}`,
              destinationFolderId: applicationFiles[application.id].folderId,
              destinationFileName: 'Covering Letter',
            });
          }
          return false;
        })
      );
      console.log('Covering Letters transfered', new Date());

      // Transfer CVs
      const cVIds = await Promise.all(
        applications.map(application => {
          if (application.uploadedCV) {
            return transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${exerciseId}/user/${application.userId}/${application.uploadedCV}`,
              destinationFolderId: applicationFiles[application.id].folderId,
              destinationFileName: 'CV',
            });
          }
          return false;
        })
      );
      console.log('CVs transfered', new Date());

      // Transfer Statement of Suitability
      const suitabilityStatementIds = await Promise.all(
        applications.map(application => {
          if (application.uploadedSuitabilityStatement) {
            transferFileFromStorage({
              storageBucket: bucket,
              fileUrl: `exercise/${exerciseId}/user/${application.userId}/${application.uploadedCV}`,
              destinationFolderId: applicationFiles[application.id].folderId,
              destinationFileName: 'Statement of Suitability',
            });
          }
          return false;
        })
      );
      console.log('Suitability Statements transfered', new Date());

      // first independent assessment
      const firstIAIds = await Promise.all(
        applications.map(application => {
          return getDocument(db.collection('assessments').doc(`${application.id}-1`)).then(assessment => {
            if (assessment && assessment.filePath) {
              let filePath = assessment.filePath;
              if (filePath.charAt(0) === '/') {
                filePath = filePath.substr(1);
              }
              return transferFileFromStorage({
                storageBucket: bucket,
                fileUrl: filePath,
                destinationFolderId: applicationFiles[application.id].folderId,
                destinationFileName: 'Independent Assessment 1',
              });
            }
            return false;
          });
        })
      );
      console.log('IA1 transfered', new Date());

      // second independent assessment
      const secondIAIds = await Promise.all(
        applications.map(application => {
          return getDocument(db.collection('assessments').doc(`${application.id}-2`)).then(assessment => {
            if (assessment && assessment.filePath) {
              let filePath = assessment.filePath;
              if (filePath.charAt(0) === '/') {
                filePath = filePath.substr(1);
              }
              return transferFileFromStorage({
                storageBucket: bucket,
                fileUrl: filePath,
                destinationFolderId: applicationFiles[application.id].folderId,
                destinationFileName: 'Independent Assessment 2',
              });
            }
            return false;
          });
        })
      );
      console.log('IA2 transfered', new Date());

      // store file ids
      applications.forEach((application, index) => {
        applicationFiles[application.id].fileIds.push(docIds[index]);
        if (assessmentIds[index]) {
          applicationFiles[application.id].fileIds.push(assessmentIds[index]);
        }
        if (coveringLetterIds[index]) {
          applicationFiles[application.id].fileIds.push(coveringLetterIds[index]);
        }
        if (cVIds[index]) {
          applicationFiles[application.id].fileIds.push(cVIds[index]);
        }
        if (suitabilityStatementIds[index]) {
          applicationFiles[application.id].fileIds.push(suitabilityStatementIds[index]);
        }
        if (firstIAIds[index]) {
          applicationFiles[application.id].fileIds.push(firstIAIds[index]);
        }
        if (secondIAIds[index]) {
          applicationFiles[application.id].fileIds.push(secondIAIds[index]);
        }
      });
      // console.log(applicationFiles);

      // update panel
      await panel.ref.update({
        status: 'created',
        folderId: panelFolderId,
        applicationFiles: applicationFiles,
      });

    }

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
