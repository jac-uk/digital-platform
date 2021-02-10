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

    const applicationFiles = {};

    // create candidate application folders
    const folderIds = await Promise.all(
      applications.map(application => {
        return drive.createFolder(`${application.personalDetails.fullName} ${application.referenceNumber}`, {
          parentId: parentFolderId,
        });
      })
    );
    applications.forEach((application, index) => {
      applicationFiles[application.id] = {
        folderId: folderIds[index],
        fileIds: [],
      };
    });

    console.log('folders created', new Date());


    // create application google docs
    const docIds = await Promise.all(
      applications.map(application => {
        const htmlString = applicationConverter.getHtmlPanelPack(application, exercise);
        return drive.createFile('Application Data', {
          folderId: applicationFiles[application.id].folderId,
          sourceType: drive.MIME_TYPE.HTML,
          sourceContent: htmlString,
          destinationType: drive.MIME_TYPE.DOCUMENT,
        });
      })
    );
    console.log('application docs created', new Date());

    // self-assessment
    const assessmentIds = await Promise.all(
      applications.map(application => {
        if (application.uploadedSelfAssessment) {
          const file = bucket.file(`exercise/${exerciseId}/user/${application.userId}/${application.uploadedSelfAssessment}`);
          return file.exists().then(exists => {
            if (exists) {
              return drive.createFile('Self Assessment', {
                folderId: applicationFiles[application.id].folderId,
                sourceType: drive.getMimeType(application.uploadedSelfAssessment),
                sourceContent: file.createReadStream(),
                destinationType: drive.MIME_TYPE.DOCUMENT,
              });
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      })
    );
    console.log('self-assessment transfered', new Date());

    // first independent assessment
    const firstIAIds = await Promise.all(
      applications.map(application => {
        return getDocument(db.collection('assessments').doc(`${application.id}-1`)).then(assessment => {
          if (assessment && assessment.filePath) {
            let filePath = assessment.filePath;
            if (filePath.charAt(0) === '/') {
              filePath = filePath.substr(1);
            }
            const file = bucket.file(filePath);
            return file.exists().then(exists => {
              if (exists) {
                return drive.createFile('Independent Assessment 1', {
                  folderId: applicationFiles[application.id].folderId,
                  sourceType: drive.getMimeType(filePath),
                  sourceContent: file.createReadStream(),
                  destinationType: drive.MIME_TYPE.DOCUMENT,
                });
              } else {
                return false;
              }
            });
          } else {
            return false;
          }
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
            const file = bucket.file(filePath);
            return file.exists().then(exists => {
              if (exists) {
                return drive.createFile('Independent Assessment 2', {
                  folderId: applicationFiles[application.id].folderId,
                  sourceType: drive.getMimeType(filePath),
                  sourceContent: file.createReadStream(),
                  destinationType: drive.MIME_TYPE.DOCUMENT,
                });
              } else {
                return false;
              }
            });
          } else {
            return false;
          }
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

};
