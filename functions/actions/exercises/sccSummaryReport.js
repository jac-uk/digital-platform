import * as helpers from '../../shared/converters/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import { getDocuments, getDocument, formatDate, splitFullName } from '../../shared/helpers.js';
import _ from 'lodash';
import { ordinal } from '../../shared/converters/helpers.js';
import htmlWriter from '../../shared/htmlWriter.js';
import config from '../../shared/config.js';
import initDrive from '../../shared/google-drive.js';
import { date, func, number } from 'assert-plus';
import initExerciseHelper from '../../shared/exerciseHelper.js';

const drive = initDrive();

export default (firebase, db) => {
  const { applicationCounts, shortlistingMethods, selectionCategories, formatSelectionDays } = initExerciseHelper(config);
  const { APPLICATION_STATUS } = config;

  return {
    generateSccSummaryReport,
  };

  async function generateSccSummaryReport(exerciseId) {
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));

    let numberOfVacancies = [];
    if (exercise.immediateStart > 0) {
      numberOfVacancies.push(`${exercise.immediateStart} Immediate start (S87)`);
    }
    if (exercise.futureStart > 0) {
      numberOfVacancies.push(`${exercise.futureStart} Future start (S94)`);
    }

    const locationDetails = exercise.location;
    const launch = formatDate(exercise.applicationOpenDate);
    const closed = formatDate(exercise.applicationCloseDate);
    
    const applicationCountValues = applicationCounts(exercise);
    const numberOfApplications = applicationCountValues.applied || 0;
    const numberOfWithdrawals = applicationCountValues.withdrawn || 0;

    const numberOfRemovedOnEligibilityOrASC = 
    (exercise._applicationRecords.status[APPLICATION_STATUS.REJECTED_INELIGIBLE_STATUTORY] || 0) + 
    (exercise._applicationRecords.status[APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL] || 0);
    
    const numberOfShortlisted = exercise._applicationRecords.status[APPLICATION_STATUS.SHORTLISTING_PASSED] || 0;
    
    const methodOfShortlisting = shortlistingMethods(exercise);
    
    const selectionDayTools = selectionCategories(exercise);
    
    const datesOfSelectionDays = formatSelectionDays(exercise);

    // construct the report document
    const report = {
      numberOfVacancies,
      locationDetails,
      launch,
      closed,
      numberOfApplications,
      numberOfWithdrawals,
      numberOfRemovedOnEligibilityOrASC,
      numberOfShortlisted,
      methodOfShortlisting,
      selectionDayTools,
      datesOfSelectionDays,
    };

    // store the report document in the database
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('sccSummary').set(report);

    // return the report in the HTTP response
    return report;
  }


  /**
   * exportApplicationEligibilityIssues
   * Generates an export of all applications in the selected exercise with eligibility issues
   * @param {*} `exerciseId` (required) ID of exercise to include in the export
   */
  async function exportSccSummaryReport(exerciseId) {

    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const sccSummaryReport = await generateSccSummaryReport(exerciseId);

        // get drive service
        await drive.login();

        // get settings and apply them
        const settings = await getDocument(db.collection('settings').doc('services'));
        drive.setDriveId(settings.google.driveId);
    
        // generate a filename for the document we are going to create ex. JAC00787_SCC Eligibility Annexes
        const now = new Date();
        // const timestamp = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
        const filename = `${exercise.referenceNumber}_SCC Summary` ;
    
        // make sure a destination folder exists to create the file in
        const folderName = 'SCC Summary Export';
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
    
        // Create eligibility issues document
        const fileId = await drive.createFile(filename, {
          folderId: folderId,
          sourceType: drive.MIME_TYPE.HTML,
          sourceContent: getHtmlSccSummaryReport(sccSummaryReport),
          destinationType: drive.MIME_TYPE.DOCUMENT,
        });
    
        if (fileId) {
          return await drive.exportFile(fileId, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        }
    
        return false;
  }

  /**
 * Exports eligibility issues to a Google Docs file
 *
 * @param {*} applicationRecords
 * @returns
 */
  async function exportSccAnnexReport(exercise, applicationRecords) {

    // get drive service
    await drive.login();

    // get settings and apply them
    const settings = await getDocument(db.collection('settings').doc('services'));
    drive.setDriveId(settings.google.driveId);

    // generate a filename for the document we are going to create ex. JAC00787_SCC Eligibility Annexes
    const now = new Date();
    // const timestamp = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
    const filename = `${exercise.referenceNumber}_SCC Eligibility Annexes` ;

    // make sure a destination folder exists to create the file in
    const folderName = 'Eligibility Export';
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

    // Create eligibility issues document
    const fileId = await drive.createFile(filename, {
      folderId: folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent: getHtmlSccSummaryReport(sccSummaryReport),
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    if (fileId) {
      return await drive.exportFile(fileId, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }

    return false;
  }

  function getHtmlSccSummaryReport(sccSummaryReport) {

    let writer = new htmlWriter();

    writer.addRaw(`
      <p style="text-align: right;"><a name="annex-a"><b>ANNEX A</b></a></p>
          `);
          writer.addHeading('JUDICIAL APPOINTMENTS ELIGIBILITY STATEMENT AND ASC', 'center');
          writer.addRaw(`
      <p class="red" style="text-align: right;">Ref: 00077</p>
      <table>
        <tbody>
          <tr>
            <td width="250"><b>Title:</b></td>
            <td colspan="4">${exercise.name}</td>
          </tr>
          <tr>
            <td width="250"><b>Statutory eligibility requirement:</b></td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <td width="250"><b>Relevant qualification:</b></td>
            <td width="75" style="text-align: center;"><b>Solicitor</b><br>${exercise.qualifications.includes('solicitor') ? 'Yes' : 'No'}</td>
            <td width="80" style="text-align: center;"><b>Barrister</b><br>${exercise.qualifications.includes('barrister') ? 'Yes' : 'No'}</td>
            <td style="text-align: center;"><b>Fellow CILEX</b><br>${exercise.qualifications.includes('cilex') ? 'Yes' : 'No'}</td>
            <td style="text-align: center;"><b>Other (e.g. Patent Agent, Medical etc)</b><br>${exercise.qualifications.includes('other') ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td width="250"><b>Non-statutory eligibility requirement<br>Approved by Lord Chancellor (N/A)</b></td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <td width="250"><b>Additional Information:</b></td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <td width="250">
              <b>Reasonable length of service (and retirement age if not 70*):</b>
              <br>
              <b>*As set out in the government response to the Judicial Mandatory Retirement Age consultation published on 8 March, it is the intention to raise the mandatory retirement age (MRA) for judicial holders to 75.</b>
            </td>
            <td colspan="4">${exercise.reasonableLengthService} ${exercise.reasonableLengthService > 1 ? 'years' : 'year'}</td>
          </tr>
          <tr>
            <td width="250">
              <b>Salaried posts only:</b>
              <br>
              <b>Previous service in judicial office</b>
            </td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <td width="250"><b>House of Commons Disqualification Act 1975 applies:</b></td>
            <td colspan="4"></td>
          </tr>
          <tr>
            <td width="250">
              <b>Salaried posts only:</b>
              <br>
              <b>Medical Examination:</b>
            </td>
            <td colspan="4"></td>
          </tr>
        </tbody>
      </table>
          `);

    return writer.toString();
  }
};

