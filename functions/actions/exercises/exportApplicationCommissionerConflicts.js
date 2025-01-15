import { getDocuments, getDocument } from '../../shared/helpers.js';
import htmlWriter from '../../shared/htmlWriter.js';
import initDrive from '../../shared/google-drive.js';

const drive = initDrive();

export default (firebase, db) => {
  return {
    exportApplicationCommissionerConflicts,
  };

  async function exportApplicationCommissionerConflicts(exerciseId, stage, status, format) {
    // get the exercise
    const exercise = await getDocument(
      db.collection('exercises').doc(exerciseId)
    );

    // get applications
    let firestoreRef = db.collection('applications')
      .where('exerciseId', '==', exerciseId);
    if (stage !== 'all') {
      firestoreRef = firestoreRef.where('stage', '==', stage);
    }
    if (status !== 'all') {
      firestoreRef = firestoreRef.where('status', '==', status);
    } else {
      firestoreRef = firestoreRef.where('status', '==', 'applied');
    }
    const applications = await getDocuments(firestoreRef);

    // generate the export (to Google Doc)
    if (format === 'googledoc') {
      return await exportToGoogleDoc(exercise, applications);
    }

    return false;
  }

  /**
   * Export commissioner conflicts to a Google Docs file
   *
   * @param {*} applications
   * @returns
   */
  async function exportToGoogleDoc(exercise, applications) {

    // get drive service
    await drive.login();

    // get settings and apply them
    const settings = await getDocument(db.collection('settings').doc('services'));
    drive.setDriveId(settings.google.driveId);

    // generate a filename for the document we are going to create
    const timestamp = (new Date()).toISOString();
    const filename = exercise.referenceNumber + '_' + timestamp;

    // make sure a destination folder exists to create the file in
    const folderName = 'Commissioner Conflicts Export';
    const folders = await drive.listFolders();
    let folderId = 0;
    folders.forEach((v, i) => {
      if (v.name === folderName) {
        folderId = v.id;
      }
    });
    if (folderId === 0) { // folder doesn't exist so create it
      folderId = await drive.createFolder(folderName);
    }

    // Create commissioner conflicts document
    const sourceContent = getHtmlCommissionerConflicts(exercise, applications);
    await drive.createFile(filename, {
      folderId: folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent,
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    // return the path of the file to the caller
    return {
      path: folderName + '/' + filename,
      sourceContent,
    };
  }

  /**
   * Generate the Commissioner conflicts report, in HTML format
   *
   * @param {*} exercise
   * @param {*} applications
   * @returns
   */
  function getHtmlCommissionerConflicts(exercise, applications) {
    let writer = new htmlWriter();
    writer.setStylesheet(`
<style>
  body {
    font-family: Khula, HelveticaNeue, Arial, Helvetica, sans-serif;
    font-size: 1.1875rem;
  }
  table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
    padding: 4px 8px;
  }
</style>
  `);

    writer.addHeading('Candidates\' Declarations', 'center');
    writer.addRaw(`
<table>
  <tr>
    <td><u>Candidate<br>Surname</u></td>
    <td><u>Candidate<br>Forename</u></td>
    <td><u>Commissioner(s) known by candidate</u></td>
    <td><u>Declaration</u></td>
  </tr>
    `);
    applications.forEach(application => {
      if (application.additionalInfo && application.additionalInfo.commissionerConflicts) {
        application.additionalInfo.commissionerConflicts
          .filter(conflict => conflict.hasRelationship)
          .forEach((conflict, index) => {
            writer.addRaw(`
  <tr>
    <td>${index === 0 ? application.personalDetails.lastName : ''}</td>
    <td>${index === 0 ? application.personalDetails.firstName : ''}</td>
    <td>${conflict.name}</td>
    <td>${conflict.details}</td>
  </tr>`
            );
        });
      }
    });
    writer.addRaw(`
</table>
    `);

    return writer.toString();
  }
};
