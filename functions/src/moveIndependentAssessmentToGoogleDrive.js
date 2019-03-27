const {google} = require('googleapis');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Config variables
const teamDriveId = '0AKR0Lvdiz0fHUk9PVA';

// Runtime variables
const vacancyId = 'vacancy';
const applicantId = 'ollie';
const assessorEmail = 'assessor@example.com';

const getFileName = (path) => {
  return path.split('/').pop();
};

const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

const uploadToGoogleDrive = async (object, localPath) => {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  const drive = google.drive({version: 'v3', auth});
  const folder = new (require('./GoogleDrive/Folder'))(drive, teamDriveId);
  const file = new (require('./GoogleDrive/File'))(drive, teamDriveId);

  const vacancyFolder = await folder.get(vacancyId);
  const applicantFolder = await folder.getOrCreate(applicantId, vacancyFolder);
  const fileName = assessorEmail + '.' + getFileExtension(object.name);

  return file.upload(
    fileName,
    fs.createReadStream(localPath),
    object.contentType,
    applicantFolder
  );
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

const moveIndependentAssessmentToGoogleDrive = async (object) => {
  const localPath = await downloadFromCloudStorage(object);
  const uploadedId = await uploadToGoogleDrive(object, localPath);
  fs.unlinkSync(localPath);
  console.log(`Uploaded ${object.name} to Drive as file ${uploadedId}`);
};

module.exports = moveIndependentAssessmentToGoogleDrive;
