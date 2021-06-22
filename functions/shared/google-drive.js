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
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      case 'xlsx':
        return MIME_TYPE.XLSX;
    }
    return '';
  }
};


/* Some useful examples */
  // // set permissions on specific folder
  // const permission = {
  //   'type': 'user',
  //   'role': 'commenter',
  //   'emailAddress': 'warren.searle@judicialappointments.digital',
  //   supportsAllDrives: true,
  // };
  // await drive.addPermission(fileId, permission);


  // // create a drive
  // var driveMetadata = {
  //   'name': 'WS Shared Drive',
  // };
  // var requestId = uuid.v4();
  // let response = await drive.drives.create({
  //   resource: driveMetadata,
  //   requestId: requestId,
  //   fields: 'id',
  // });
  // const driveId = response.data.id;
  // console.log(driveId);


  // list drives
  // const response = await drive.drives.list();
  // const drives = response.data.drives;
  // console.log(drives);

  // // list files on specific drive
  // // const response = await driveService.files.list({
  // //   corpora: 'drive',
  // //   driveId: driveId,
  // //   includeItemsFromAllDrives: true,
  // //   supportsAllDrives: true,
  // //   pageSize: 10,
  // //   fields: 'nextPageToken, files(id, name)',
  // // });
  // // const files = response.data.files;
  // // if (files.length) {
  // //   files.map(async (file) => {
  // //     console.log(file);
  // //     console.log(await driveService.files.delete({
  // //       fileId: file.id,
  // //       supportsAllDrives: true,
  // //     }));
  // //     console.log(`${file.name} (${file.id})`);
  // //   });
  // // }

  // // list permissions on a specific drive
  // const response = await drive.permissions.list({
  //   corpora: 'drive',
  //   driveId: driveId,
  //   fileId: '1wCqR71lOCtyTExFBZoyDVZKPeaP8tlk9-vLF8FuFoak',
  //   includeItemsFromAllDrives: true,
  //   supportsAllDrives: true,
  //   pageSize: 10,
  //   //fields: 'nextPageToken, files(id, name)',
  // });
  // const permissions = response.data.permissions;
  // if (permissions.length) {
  //   permissions.map((permission) => {
  //     console.log(permission);
  //     // console.log(`${file.name} (${file.id})`);
  //   });
  // }
