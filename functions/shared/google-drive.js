const { google } = require('googleapis');
const Bottleneck = require('bottleneck');

module.exports = () => {

  const MIME_TYPE = {
    FOLDER: 'application/vnd.google-apps.folder',
    DOCUMENT: 'application/vnd.google-apps.document',
    HTML: 'text/html',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    PDF: 'application/pdf',
    ODT: 'application/vnd.oasis.opendocument.text',
    TXT: 'text/plain',
  };

  let drive;
  let currentDriveId;
  let limiter;

  return {
    login,
    setDriveId,
    createFolder,
    createFile,
    copyFile,
    deleteFolder,
    deleteFile,
    addPermission,
    getMimeType,
    MIME_TYPE,
  };

  async function login() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
    limiter = new Bottleneck({
      minTime: 150,
      maxConcurrent: 10,
    });
    return drive;
  }

  function setDriveId(driveId) {
    currentDriveId = driveId;
  }

  function createFolder(folderName, params) {
    const metaData = {
      'name': folderName,
      'mimeType': 'application/vnd.google-apps.folder',
      'driveId': currentDriveId,
    };
    if (params && params.parentId) {
      metaData.parents = [params.parentId];
    } else {
      metaData.parents = [currentDriveId];
    }
    return limiter.schedule(
      () => {
        // console.log('createFolder started', new Date());
        return drive.files.create({
          resource: metaData,
          supportsAllDrives: true,
          fields: ['id'],
        });
      }
    ).then(folder => {
      // console.log('createFolder finished', new Date());
      return folder.data.id;
    });
  }

  function createFile(fileName, { folderId, sourceType, destinationType, sourceContent }) {
    const source = {
      body: sourceContent,
    };
    if (sourceType) {
      source.mimeType = sourceType;
    }
    const metaData = {
      name: fileName,
      driveId: currentDriveId,
    };
    if (destinationType) {
      metaData.mimeType = destinationType;
    }
    if (folderId) {
      metaData.parents = [folderId];
    } else {
      metaData.parents = [currentDriveId];
    }
    return limiter.schedule(
      () => {
        // console.log('createFile started', new Date());
        return drive.files.create({
          resource: metaData,
          media: source,
          supportsAllDrives: true,
          fields: 'id',
        });
      }).then(file => {
        // console.log('createFile finished', new Date());
        return file.data.id;
    });
  }

  function copyFile(fileId, folderId) {
    return drive.files.copy({
      fileId: fileId,
      resource: {
        parents: [folderId],
      },
      supportsAllDrives: true,
      fields: 'id',
    }).then(file => file.data.id);
  }

  function deleteFile(fileId) {
    if (fileId) {
      return limiter.schedule(
        () => drive.files.delete({
          fileId: fileId,
          driveId: currentDriveId,
          supportsAllDrives: true,
        })
      );
    }
    return false;
  }

  function deleteFolder(folderId) {
    return deleteFile(folderId);
  }

  async function addPermission(fileId, permission) {
    await drive.permissions.create({
      resource: permission,
      fileId: fileId,
    });
  }

  function getMimeType(fileName) {
    const fileNameParts = fileName.split('.');
    switch (fileNameParts[fileNameParts.length - 1].toLowerCase()) {
      case 'htm':
      case 'html':
        return MIME_TYPE.HTML;
      case 'docx':
        return MIME_TYPE.DOCX;
      case 'doc':
        return MIME_TYPE.DOC;
      case 'odt':
      case 'fodt':
        return MIME_TYPE.ODT;
      case 'txt':
        return MIME_TYPE.TXT;
      case 'pdf':
        return MIME_TYPE.PDF;
    }
    return '';
  }
};
