const {google,} = require('googleapis');
const functions = require('firebase-functions');
const {Storage,} = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const fs = require('fs');
const Folder = require('../GoogleDrive/Folder');

const getFileName = (path) => {
  return path.split('/').pop();
};

const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

const uploadToGoogleDrive = async (object, reference, localPath) => {
  const teamDriveId = functions.config().references.team_drive_id;
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const drive = google.drive({version: 'v3', auth,});
  const folder = new Folder(drive, teamDriveId);

  const referenceData = reference.data();
  const vacancyFolder = await folder.getOrCreate(referenceData.vacancy_title);
  const applicantFolder = await folder.getOrCreate(referenceData.applicant_name, vacancyFolder);

  const ext = getFileExtension(object.name);
  const fileName = `${referenceData.assessor.name} (${referenceData.type}).${ext}`;

  const fileMetadata = {
    name: fileName,
    teamDriveId,
    parents: [applicantFolder],
    originalFilename: getFileName(object.name),
    properties: {
      applicationId: referenceData.application.id,
      referenceId: reference.id,
    },
  };

  const media = {
    mimeType: object.contentType,
    body: fs.createReadStream(localPath),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
    supportsTeamDrives: true,
  });

  return file.data.id;
};

const downloadFromCloudStorage = async (object) => {
  const fileName = getFileName(object.name);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const gcs = new Storage();

  await gcs.bucket(object.bucket)
    .file(object.name)
    .download({
      destination: tempFilePath,
    });

  return tempFilePath;
};

const moveToGoogleDrive = async (object, reference) => {
  const localPath = await downloadFromCloudStorage(object);
  const uploadedId = await uploadToGoogleDrive(object, reference, localPath);
  fs.unlinkSync(localPath);
  console.log(`Uploaded "${object.name}" to Drive as file ID ${uploadedId}`);
};

module.exports = moveToGoogleDrive;
