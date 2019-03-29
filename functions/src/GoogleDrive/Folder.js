const escapeSingleQuotes = string => (string.replace(/'/g, "\\'"));

class Folder {

  constructor(driveClient, teamDriveId) {
    this.drive = driveClient;
    this.teamDriveId = teamDriveId;
  }

  async get(name, parentId) {
    name = escapeSingleQuotes(name);

    let query = "mimeType='application/vnd.google-apps.folder'";
    query += ` and name='${escapeSingleQuotes(name)}'`;
    if (parentId) {
      query += ` and '${escapeSingleQuotes(parentId)}' in parents`;
    }

    const results = await this.drive.files.list({
      q: query,
      pageSize: 1,
      fields: 'files(id)',
      supportsTeamDrives: true,
      includeTeamDriveItems: true,
      corpora: 'teamDrive',
      teamDriveId: this.teamDriveId,
    });

    if (results.data.files.length === 1) {
      return results.data.files[0].id;
    }

    throw new Error(`Folder not found: "${name}" with parent ID "${parentId}"`);
  }

  async create(name, parentId) {
    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      teamDriveId: this.teamDriveId,
      parents: [this.teamDriveId],
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await this.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
      supportsTeamDrives: true,
    });

    return folder.data.id;
  }

  async getOrCreate(name, parentId) {
    let id;

    try {
      id = await this.get(name, parentId);
    }
    catch (error) {
      id = await this.create(name, parentId);
    }

    return id;
  }

}

module.exports = Folder;
