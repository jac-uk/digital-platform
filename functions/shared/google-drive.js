import { google } from 'googleapis';
import Bottleneck from 'bottleneck';

export default () => {

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
    listSharedDrives,
    setDriveId,
    listFolders,
    createFolder,
    deleteFolder,
    createFile,
    deleteFile,
    copyFile,
    exportFile,
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

  async function listSharedDrives(driveName = '') {
    try {
      const metaData = {
        fields: 'drives(id, name)',
      };
      if (driveName) {
        metaData.q = `name='${driveName}'`;
      }

      const response = await drive.drives.list(metaData);
      return response.data.drives;
    } catch (error) {
      console.error('Error listing Shared Drives:', error.message);
      return [];
    }
  }

  function setDriveId(driveId) {
    currentDriveId = driveId;
  }

  async function listFolders(driveId, includeTrashed = false, name = '') {
    let q = `mimeType='application/vnd.google-apps.folder' and trashed=${includeTrashed ? 'true' : 'false'}`;
    if (name) {
      q += ` and name='${name}'`;
    }

    const response = await drive.files.list({
      corpora: 'drive',
      driveId: driveId || currentDriveId,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q,
      fields: 'files(id, name)',
    });
    return response.data.files;
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

  /**
   * Export a file to base64 string
   * 
   * @param {string} fileId 
   * @param {string} mimeType 
   * @returns 
   */
  async function exportFile(fileId, mimeType) {
    try {
      const res = await drive.files.export({
        fileId: fileId,
        mimeType: mimeType,
      }, {
        responseType: 'arraybuffer',
      });
      if (!res.data) return null;
      return Buffer.from(res.data).toString('base64');
    } catch (error) {
      console.error(error);
      return null;
    }
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
