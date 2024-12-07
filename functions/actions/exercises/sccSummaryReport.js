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

  function getHtmlSccSummaryReport(sccSummaryReport) {
    const {
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
    } = sccSummaryReport;

    const rows = [
      { header: 'Number of vacancies', content: numberOfVacancies.join(' ,') },
      { header: 'Number of candidates proposed for Recommendation', content: '' },
      { header: 'Vacancies by jurisdiction/chamber', content: '' },
      { header: 'Location details', content: locationDetails },
      { header: 'VR (includes details of SPTW)', content: 'Annex <span style="color:red" >X</span>' },
      { header: '', content: '' },
      { header: 'Launch', content: launch },
      { header: 'Closed', content: closed },
      { header: 'Number of applications', content: numberOfApplications },
      { header: 'Number of withdrawals', content: numberOfWithdrawals },
      { header: 'Number removed on eligibility/ASC', content: numberOfRemovedOnEligibilityOrASC },
      { header: '', content: '' },
      { header: 'Number shortlisted', content: numberOfShortlisted },
      { header: 'Method of shortlisting', content: methodOfShortlisting.join(' ,') },
      { header: 'Dates of shortlisting', content: '' },
      { header: '', content: '' },
      { header: 'Statutory consultee(s)', content: '<span style="color:red"><pre>insert name/s or &#39;consultation waived&#39;</pre> </span>' },
      { header: '', content: '' },
      { header: 'Selection day tools', content: selectionDayTools.join(' ,') },
      { header: 'Number of A-C candidates', content: '' },
      { header: 'Dates of selection days', content: datesOfSelectionDays },
      { header: '', content: '' },
      { header: '<if applicable> Date s.94 list Created', content: '' },
      { header: '<if applicable> Candidates Remaining on s.94 list', content: '' },
      { header: '', content: '' },
      { header: 'Character Checks undertaken', content: '<b style="font-style:italic">E.g. HMRC, ACRO, BSB, etc</b>' },
      { header: 'Character issues', content: 'No issues identified or &lt;All issues were considered when s.94 list was created and no further issues identified&gt; or &lt;The following matters require a decision&gt; &lt;Amend as needed&gt; &lt;This exercise uses the revised Good Character Guidance launched on 15 October&gt; or &lt;This exercise uses the older Good Character Guidance before its launch on 15 October&gt;:' },
      { header: 'Matters requiring a decision', content: 'Annex <span style="font-red">X</span>' },
      { header: 'Previously declared, within guidance', content: 'Annex <span style="font-red">X</span>' },
      { header: 'High scoring D candidates', content: 'Annex <span style="font-red">X</span>' },
    ];

    let writer = new htmlWriter();
    writer.addHeading('Summary', 'center');
    writer.addRaw(`
      <table>
        <tbody>`
    );
    for (const row of rows) {
      writer.addRaw(
        `<tr>
          <td><b>${row.header}</b></td>
          <td>${row.content}</td>
        </tr>`
      );
    }
    writer.addRaw(
       `</tbody>
      </table>`);

    return writer.toString();
  }
};

