import { getDocument, formatDate } from '../../shared/helpers.js';
import htmlWriter from '../../shared/htmlWriter.js';
import config from '../../shared/config.js';
import initDrive from '../../shared/google-drive.js';
import initExerciseHelper from '../../shared/exerciseHelper.js';

const drive = initDrive();

export default (firebase, db) => {
  const { SELECTION_CATEGORIES, applicationCounts, shortlistingMethods, formatSelectionDays } = initExerciseHelper(config);
  const { APPLICATION_STATUS } = config;

  return {
    generateSccSummaryReport,
    exportSccSummaryReport,
  };

  async function generateSccSummaryReport(exerciseId) {
    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const sccSummaryReport = await db.collection('exercises').doc(exerciseId).collection('reports').doc('sccSummary').get();
    const reportData = sccSummaryReport.exists ? sccSummaryReport.data() : {};

    // set the report-specific fields from the report document
    const numberOfCandidatesProposedForRecommendation = reportData.numberOfCandidatesProposedForRecommendation || '';
    const shortlistingDates = reportData.shortlistingDates || '';
    const statutoryConsultees = reportData.statutoryConsultees || '';
    const vr = reportData.vr || '';
    const dateS94ListCreated = reportData.dateS94ListCreated || '';
    const candidatesRemainingOnS94List = reportData.candidatesRemainingOnS94List || ''; 
    const vacanciesByJurisdictionChamber = reportData.vacanciesByJurisdictionChamber || '';
    const characterChecksUndertaken = reportData.characterChecksUndertaken || '';
    const numberOfACandidates = reportData.numberOfACandidates || '';
    const characterIssues = reportData.characterIssues || '';
    const mattersRequiringADecision = reportData.mattersRequiringADecision || '';
    const previouslyDeclaredWithinGuidance = reportData.previouslyDeclaredWithinGuidance || '';
    const highScoringDCandidates = reportData.highScoringDCandidates || '';

    // set the report-specific fields from the exercise document
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

    let numberOfRemovedOnEligibilityOrASC = 0;
    let numberOfShortlisted = 0;

    if (exercise._applicationRecords.status) {
      numberOfRemovedOnEligibilityOrASC = 
        (exercise._applicationRecords.status[APPLICATION_STATUS.REJECTED_INELIGIBLE_STATUTORY] || 0) + 
        (exercise._applicationRecords.status[APPLICATION_STATUS.REJECTED_INELIGIBLE_ADDITIONAL] || 0);
      numberOfShortlisted = exercise._applicationRecords.status[APPLICATION_STATUS.SHORTLISTING_PASSED] || 0;
    }
    
    const shortlistingMethod = shortlistingMethods(exercise);
    const selectionCategories = exercise.selectionCategories || [];
    const selectionDayTools = Object.values(SELECTION_CATEGORIES).filter((c) => selectionCategories.includes(c.value)).map((c) => c.description);
    const datesOfSelectionDays = exercise.selectionDays || [];

    // construct the report document
    const report = {
      numberOfVacancies: numberOfVacancies.join(', '),
      locationDetails,
      launch,
      closed,
      numberOfApplications,
      numberOfWithdrawals,
      numberOfRemovedOnEligibilityOrASC,
      numberOfShortlisted,
      selectionDayTools: selectionDayTools.join(', '),
      datesOfSelectionDays,
      numberOfACandidates,
      characterChecksUndertaken,
      characterIssues,
      mattersRequiringADecision,
      previouslyDeclaredWithinGuidance,
      highScoringDCandidates,
      numberOfCandidatesProposedForRecommendation,
      vacanciesByJurisdictionChamber,
      vr,
      shortlistingDates,
      statutoryConsultees: statutoryConsultees.length > 0 ? statutoryConsultees : 'Insert name(s) or Consultation waived',
      dateS94ListCreated,
      candidatesRemainingOnS94List, 
      shortlistingMethod: shortlistingMethod.join(', '),
    };

    // store the report document in the database
    await db.collection('exercises').doc(exerciseId).collection('reports').doc('sccSummary').set(report, { merge: true });

    // return the report in the HTTP response
    return report;
  }

  /**
   * exportSccSummaryReport
   * Generates an export of the SCC Summary report for the selected exercise
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
    
        // generate a filename for the document we are going to create ex. JAC00787_SCC Summary
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
    
        // Create SCC Summary document
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
      selectionDayTools,
      datesOfSelectionDays,
      numberOfACandidates,
      characterChecksUndertaken,
      characterIssues,
      mattersRequiringADecision,
      previouslyDeclaredWithinGuidance,
      highScoringDCandidates,
      numberOfCandidatesProposedForRecommendation,
      vacanciesByJurisdictionChamber,
      vr,
      shortlistingDates,
      statutoryConsultees,
      dateS94ListCreated,
      candidatesRemainingOnS94List,
      shortlistingMethod,
    } = sccSummaryReport;

    const rows = [
      { header: 'Number of vacancies', content: numberOfVacancies },
      { header: 'Number of candidates proposed for Recommendation', content: numberOfCandidatesProposedForRecommendation },
      { header: 'Vacancies by jurisdiction/chamber', content: vacanciesByJurisdictionChamber },
      { header: 'Location details', content: locationDetails },
      { header: 'VR (includes details of SPTW)', content: `Annex ${vr}` },
      { header: '', content: '' },
      { header: 'Launch', content: formatDate(launch, 'DD/MM/YYYY') },
      { header: 'Closed', content: formatDate(closed, 'DD/MM/YYYY') },
      { header: 'Number of applications', content: numberOfApplications },
      { header: 'Number of withdrawals', content: numberOfWithdrawals },
      { header: 'Number removed on eligibility/ASC', content: numberOfRemovedOnEligibilityOrASC },
      { header: '', content: '' },
      { header: 'Number shortlisted', content: numberOfShortlisted },
      { header: 'Method of shortlisting', content: shortlistingMethod },
      { header: 'Dates of shortlisting', content: shortlistingDates },
      { header: '', content: '' },
      { header: 'Statutory consultee(s)', content: statutoryConsultees },
      { header: '', content: '' },
      { header: 'Selection day tools', content: selectionDayTools },
      { header: 'Number of A-C candidates', content: numberOfACandidates },
      { header: 'Dates of selection days', content: formatSelectionDays({ selectionDays: datesOfSelectionDays}).join(', ') },
      { header: '', content: '' },
      { header: 'Date s.94 list Created', content: dateS94ListCreated },
      { header: 'Candidates Remaining on s.94 list', content: candidatesRemainingOnS94List },
      { header: '', content: '' },
      { header: 'Character Checks undertaken', content: characterChecksUndertaken },
      { header: 'Character issues', content: characterIssues },
      { header: 'Matters requiring a decision', content: `Annex ${mattersRequiringADecision}` },
      { header: 'Previously declared, within guidance', content: `Annex ${previouslyDeclaredWithinGuidance}` },
      { header: 'High scoring D candidates', content: `Annex ${highScoringDCandidates}` },
    ];

    let writer = new htmlWriter();
    writer.addHeading('SCC Summary', 'center');
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

