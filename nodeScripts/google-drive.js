'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { getDocument } = require('../functions/shared/helpers');
const uuid = require('uuid');
const drive = require('../functions/shared/google-drive')();

const main = async () => {
  // const application = await getDocument(db.collection('applications').doc('testData-1'));

  const strHtml = `<!DOCTYPE html>
    <html>
    <head>
      <style>
        table,
        th,
        td {
          border: 1px solid black;
        }
      </style>
    </head>
    <body>
      <h1>JAC0001-abc123</h1>
      <table>
        <tr>
          <th>Qualification</th>
          <td>Solicitor</td>
        </tr>
        <tr>
          <th>Location</th>
          <td>Wales</td>
        </tr>
      </table>
    </body>
  </html>`;

  // const driveId = '0AIKGIGesrczjUk9PVA';
  const driveId = '0AHs0fIN6F04CUk9PVA';
  await drive.login();
  drive.setDriveId(driveId);
  // let folderId = await drive.createFolder('JAC0001');
  // folderId = await drive.createFolder('applications', {
  //   parentId: folderId,
  // });
  // folderId = await drive.createFolder('JAC0001-abc123', {
  //   parentId: folderId,
  // });
  const fileId = await drive.createFile('application-abc123', {
    // folderId: folderId,
    sourceType: drive.MIME_TYPE.HTML,
    sourceContent: strHtml,
    destinationType: drive.MIME_TYPE.DOCUMENT,
  });
  console.log(fileId);

  // const fileId = '1YhurwpUxtiLMuwCQQXs5fkrGOTI0pbj9AtMEpCSyIDQ';


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

//  const permissionIds = ['03272123945758523532', '12344764715895508609', '18189088842950959214'];






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
