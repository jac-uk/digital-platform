'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const { exportToGoogleDrive } = require('../functions/actions/exercises/exportToGoogleDrive')(config, firebase, db);

const main = async () => {

  const driveId = '0AN9QJOw_we0gUk9PVA';
  const rootFolderId = '1Ad7fEy9Lz4Xxh7569oExSz5uO47xcWzK';
  const exerciseId = 'kVlymRGRhZndRaQuqDTf';

  await exportToGoogleDrive(driveId, rootFolderId, exerciseId);

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
