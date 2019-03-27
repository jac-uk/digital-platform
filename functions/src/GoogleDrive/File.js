class File {

  constructor(driveClient, teamDriveId) {
    this.drive = driveClient;
    this.teamDriveId = teamDriveId;
  }

  async upload(fileName, fileStream, mimeType, parentId) {
    const fileMetadata = {
      name: fileName,
      teamDriveId: this.teamDriveId,
      parents: [parentId],
    };

    const media = {
      mimeType,
      body: fileStream,
    };

    const file = await this.drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
      supportsTeamDrives: true,
    });

    return file.data.id;
  }

}

module.exports = File;
