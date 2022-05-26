const helpers = require('../../shared/converters/helpers');
const lookup = require('../../shared/converters/lookup');
const { getDocuments } = require('../../shared/helpers');
const { getDocument } = require('../../shared/helpers');
const _ = require('lodash');
const {formatDate} = require('../../shared/converters/helpers');
const htmlWriter = require('../../shared/htmlWriter');
const config = require('../../shared/config');
const drive = require('../../shared/google-drive')();

module.exports = (firebase, db) => {

  return {
    exportApplicationEligibilityIssues,
  };

  /**
   * exportApplicationEligibilityIssues
   * Generates an export of all applications in the selected exercise with eligibility issues
   * @param {*} `exerciseId` (required) ID of exercise to include in the export
   */
  async function exportApplicationEligibilityIssues(exerciseId, stage, status, format) {

    // get the exercise
    const exercise = await getDocument(
      db.collection('exercises').doc(exerciseId)
    );

    const applicationRecords = await getDocuments(db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('flags.eligibilityIssues', '==', true));

    const headers = [
      'Ref',
      'Name',
      'Email',
      'Citizenship',
      'Date of Birth',
      'Qualifications',
      'Post-qualification Experience',
    ];

    for (let i = 0, len = applicationRecords.length; i < len; i++) {
      const applicationRecord = applicationRecords[i];
      //add application records to applicationRecords.application records
      applicationRecords[i].application = await getDocument(
        db.collection('applications')
          .doc(applicationRecord.application.id)
      );
    }

    // generate the export (to Google Doc)
    if (format === 'googledoc') {
      return exportToGoogleDoc(exercise, applicationRecords);
    }
    
    return {
      headers: headers,
      rows: eligibilityIssuesExport(applicationRecords),
    };
  }

  /**
   * Exports eligibility issues to a Google Docs file
   *
   * @param {*} applicationRecords
   * @returns
   */
   async function exportToGoogleDoc(exercise, applicationRecords) {

    // get drive service
    await drive.login();

    // get settings and apply them
    const settings = await getDocument(db.collection('settings').doc('services'));
    drive.setDriveId(settings.google.driveId);

    // generate a filename for the document we are going to create
    const timestamp = (new Date()).toISOString();
    const filename = exercise.referenceNumber + '_' + timestamp;

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
    await drive.createFile(filename, {
      folderId: folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent: getHtmlEligibilityIssues(exercise, applicationRecords),
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    // return the path of the file to the caller
    return {
      path: folderName + '/' + filename,
    };
  }

  function getHtmlEligibilityIssues(exercise, applicationRecords) {

    dumpEligibilityIssues(applicationRecords);

    const now = getDateString(new Date());
    const referenceNumber = exercise.referenceNumber;
    const title = exercise.name;
    const candidateNum = applicationRecords.length;
    const exerciseImmediateStart = exercise.immediateStart;
    const exerciseFutureStart = exercise.futureStart;
    const applicationOpenDate = getDateString(new Date(exercise.applicationOpenDate._seconds * 1000));
    const applicationCloseDate = getDateString(new Date(exercise.applicationCloseDate._seconds * 1000));
    const applicationTotalNum = exercise._applications._total;
    const applicationWithdrawnNum = exercise._applications.withdrawn || 0;

    const applicationEligibilityProceed = applicationRecords.filter(ar => (
      ar.issues && ar.issues.eligibilityIssuesStatus && 
      ar.issues.eligibilityIssuesStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.PROCEED
    ));
    const applicationEligibilityNotProceed = applicationRecords.filter(ar => (
      ar.issues && ar.issues.eligibilityIssuesStatus && 
      (ar.issues.eligibilityIssuesStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT || ar.issues.eligibilityIssuesStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT_NON_DECLARATION)
    ));

    const stylesheet = `
      <style>
        html, body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 1rem;
        }
      </style>
    `;
    let writer = new htmlWriter({ stylesheet });

    // first page
    writer.addRaw(`
      <p style="font-family: Arial; font-size: 10pt; text-align: center;"><b>OFFICIAL - SENSITIVE</b></p>
    `);
    writer.addRaw(`
      <div style="font-weight: 700; font-size: 11pt; text-align: center; margin-top: -150px;">
        <div style="margin-top: 50px;">
          <img style="width: 1.17in; height: 1.05in" src="data:image/jpeg;base64,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" />
        </div>
          <p style="margin-top: 120px;">Selection and Character Committee</p>
          <p style="margin-top: 13px;">${now}</p>
          <h3 style="font-size: 11pt; margin-top: 28px;">Eligibility/Additional Selection Criteria Paper</h3>
          <p style="margin-top: 28px;">for</p>
          <p style="margin-top: 13px;">${referenceNumber} ${title}</p>
          <p style="margin-top: 13px; color: red;">(JAC/SCC/xx/xxx)</p>
          <div style="margin-top: 220px; text-align: left;">
            <p>Assigned Commissioner:</p>
            <p style="margin-top: 13px;">Senior Selection Exercise Manager:</p>
            <p style="margin-top: 13px;">Selection Exercise Manager:</p>
          </div>
        </div>
    `);

    // outline
    writer.addRaw(addNewHtmlPage());
    writer.addRaw(`
      <div style="font-family: 'Arial';">
        <p><b>Eligibility/Additional Selection Criteria Paper</b></p>
        <br>
        <p><b><u>Contents</u></b></p>
        <br>
        <p><a href="#summary">Summary</a></p>
        <br>
        <p><a href="#recommendation">Recommendation</a></p>
        <br>
        <p><a href="#background">Background</a></p>
        <br>
        <p><a href="#eligibility">Eligibility</a></p>
        <br>
        <p><a href="#additional">Additional Selection Criteria</a></p>
        <br>
        <p><a href="#service">Reasonable Length of Service</a></p>
        <br>
        <p><a href="#service">ANNEX A</a> Judicial Appointments Eligibility Statement and ASC</p>
        <br>
        <p><a href="#service">ANNEX B</a> Candidates recommended to proceed and reasons why they are considered to meet the ASC</p>
        <br>
        <p><a href="#service">ANNEX C</a> Candidates recommended not to proceed and reasons why they are considered not to meet the ASC</p>
      </div>
    `);

    writer.addRaw(addNewHtmlPage());
    writer.addRaw(`
      <div style="font-family: 'Arial'; font-size: 11pt;">
        <p id="summary"><b>Summary</b></p><br>
        <ol>
          <li>
            <p>This paper provides information about <b>${candidateNum}</b> ${candidateNum > 1 ? 'candidates' : 'candidate'} for the post <b>${title}</b> and the extent to which they satisfy the Lord Chancellor's Additional Selection Criteria (ASC).</p>
          </li>
        </ol>
        <br>
        <p id="recommendation"><b>Recommendation</b></p>
        <br>
        <ol start="2">
          <li>
            <p>The Committee is asked to consider and agree the recommendations set out in <a href="annex-b">Annex B</a> and <a href="annex-c">Annex C</a>.</p>
          </li>
        </ol>
        <br>
        <p id="background"><b>Background</b></p>
        <br>
        <ol start="3">
          <li>
            <p>
              The Judicial Appointments Commission received a vacancy request on 
              <span style="color: red;">date</span> asking us to select 
              ${exerciseImmediateStart} ${exerciseImmediateStart > 1 ? 'candidates' : 'candidate'} for appointment under section 87 of the Constitutional Reform Act 2005 (CRA)
              ${!exerciseFutureStart ? '' : exerciseFutureStart + (exerciseFutureStart > 1 ? ' candidates' : ' candidate') + ' for appointment under section 94 of the Constitutional Reform Act 2005 (CRA)'}.
            </p>
          </li>
          <br>
          <li>
            <p>
              The exercise launched on ${applicationOpenDate} and closed for applications on ${applicationCloseDate}. 
              A total of ${applicationTotalNum} ${applicationTotalNum > 1 ? 'applications were' : 'application was'} received with 
              ${applicationWithdrawnNum === 0 ? 'no candidates' : applicationWithdrawnNum + (applicationWithdrawnNum > 1 ? ' candidates' : ' candidate')}</span> withdrawing during the course of the exercise.
              ${exercise._applicationRecords.shortlisted === 0 ? '' : exercise._applicationRecords.shortlisted + (exercise._applicationRecords.shortlisted > 1 ? ' candidates have' : ' candidate has')}</span> been shortlisted at the sift.
            </p>
          </li>
          <br>
          <li>
            <p>The statutory eligibility requirements and ASC for this exercise are at <a href="#annex-a"><b>Annex A</b></a>.</p>
          </li>
        </ol>
        <br>
        <p id="eligibility"><b>Eligibility</b></p>
        <br>
        <ol start="6">
          <li>
            <p>Checks were conducted
              ${applicationEligibilityNotProceed.length === 0
                ? ' and all candidates meet the statutory eligibility requirements for this exercise.'
                : applicationEligibilityNotProceed.length === 1
                  ? ' and 1 candidate did not meet the statutory eligibility requirements for this exercise. Those that do not are listed at <a href="annex-b"><b>Annex B</b></a>.'
                  : ' and ' + applicationEligibilityNotProceed.length + ' candidates did not meet the statutory eligibility requirements for this exercise. Those that do not are listed at <a href="annex-b"><b>Annex B</b></a>.'
              }
            </p>
          </li>
          <br>
          <li>
            <p>
              <span style="color: red;">number</span> candidates' statutory eligibility was considered by the Lord Chancellor under the Tribunals, Courts and Enforcement Act 2007. 
              <span style="color: red;">number</span> were deemed ineligible by the Lord Chancellor and are now listed at <a href="#"><b style="color: red;">Annex X</b></a> for information purposes.
            </p>
          </li>
        </ol>
        <br>
        <p id="additional-selection-criteria" style="color: red;"><b>Additional Selection Criteria</b></p>
        <br>
        <ol start="8">
          <li>
            <p>Candidates are expected to have previous judicial experience, sitting as a judge in a salaried or fee-paid capacity or a similar role such as the chair of an equivalent body for which a legal qualification is required.</p>
            <br>
            <p>An equivalent body is one of a quasi-judicial nature for which the powers and procedures should resemble those of a court of law and involve highly complex matters, requiring its members objectively to determine the facts and draw conclusions to reach a reasoned decision. Such decisions could result in the imposition of a penalty, and they are likely to affect the legal rights, duties or privileges of specific parties. Examples could include, but are not restricted to:</p>
            <br>
            <p>A. Coroner</p>
            <br>
            <p>B. Disciplinary tribunals and conduct hearings for professional standards bodies</p>
            <br>
            <p>C. Arbitration</p>
            <br>
            <p>D. Parole Board</p>
            <br>
            <p>E. Chair of a statutory inquiry</p>
            <br>
            <p>The length of judicial experience required is a minimum of 30 completed sitting days since appointment, not including training or sick days.</p>
            <br>
            <p>Only in exceptional cases and if the candidate in question has demonstrated the necessary skills in some other significant way should an exception be made.</p>
          </li>
          <br>
          <li>
            <p>The Lord Chancellor has also provided ASC that <b style="color: red;">details of ASC</b></p>    
          </li>
          <br>
          <li>
            <p><a href="#annex-b"><b>Annex B</b></a> lists candidates who are considered not to meet the ASC but are recommended to proceed, and/or are considered to have demonstrated the necessary skills in some other significant way.</p>
          </li>
          <br>
          <li>
            <p><a href="#annex-c"><b>Annex C</b></a> lists candidates who are considered not to meet the ASC and are not recommended to proceed.</p>
          </li>
        </ol>
        <br>
        <p style="color: red;"><b>Reasonable Length of Service</b></p>
        <br>
        <ol start="12">
          <li>
            <p>
              The Lord Chancellor expects candidates to be able to offer a reasonable length of service following recommendation for appointment and before retirement. 
              Following the Public Service Pensions and Judicial Office Act 2022 receiving Royal Assent on 10 March 2022, the mandatory retirement age is 75. 
              The age at which someone is appointed to this office must allow for a reasonable length of service before retirement, usually for this position ${exercise.reasonableLengthService} ${exercise.reasonableLengthService > 1 ? 'years' : 'year'}. 
              ${applicationEligibilityNotProceed.length > 0 ? '' : 'All candidates meet the reasonable length of service criterion.'}
          </li>
          <br>
          <li>
            <p style="color: red;">
              <a href="#"><b>Annex X</b></a> lists the candidate <span style="color: red;">(s) </span>whose age <span style="color: red;">(s)</span> do <span style="color: red;">(es)</span> not allow for this reasonable length of service before retirement.
            </p>
          </li>
        </ol>
        <br>
        <p style="color: red;"><b>Character</b></p>
        <br>
        <ol start="14">
          <li>
            <p>We have carried out preliminary character checks and the following issues have been identified:</p>
            <ul>
              <li>Candidates whose character issues require a character decision (Annex X)</li>
              <li>Candidates recommended to proceed as character issues within precedent (Annex X)</li>
            </ul>
          </li>
        </ol>
        <br><br><br><br><br><br><br><br>
        <p><b>Selection Exercise Manager</b></p>
      </div>
    `);

    // ANNEX A
    writer.addRaw(addNewHtmlPage());
    writer.addRaw(`
      <div style="font-family: 'Arial'; font-size: 11pt;">
        <p style="text-align: right;"><b>ANNEX A</b></p>
        <p style="text-align: center;"><b>JUDICIAL APPOINTMENTS ELIGIBILITY STATEMENT</b></p>
        <br>
        <p style="text-align: right; color: red;">Ref: 00077</p>
        <table style="font-family: 'Arial'; font-size: 0.75rem;">
          <tbody>
            <tr>
              <td width="250"><b>Title:</b></td>
              <td colspan="4">${title}</td>
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
      </div>
    `);

    const group = [
      config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.PROCEED,
      config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT,
    ];
    group.forEach((currentStatus) => {

      statusGroupARs = applicationRecords.filter(ar => {
        if (!ar.issues || !ar.issues.eligibilityIssuesStatus) return false;

        if (currentStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT) {
          return ar.issues.eligibilityIssuesStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT || 
            ar.issues.eligibilityIssuesStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT_NON_DECLARATION;
        } else {
          return ar.issues.eligibilityIssuesStatus === currentStatus;
        }
      });

      if (statusGroupARs.length === 0) { // no applications found
        return; // next iteration (skip this report group)
      }

      writer.addRaw(addNewHtmlPage());

      if (currentStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.PROCEED) {
        writer.addRaw(`
          <p style="text-align: right;"><b>ANNEX B</b></p>
          <p style="font-family: 'Arial'; font-weight: 700; font-size: 11pt; text-align: center; margin: 10px 0">
            Candidates recommended to proceed and reasons why they are considered to meet the ASC
          </p>
        `);
      } else if (
        currentStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT ||
        currentStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.REJECT_NON_DECLARATION
      ) {
        writer.addRaw(`
          <p style="text-align: right;"><b>ANNEX C</b></p>
          <p style="font-family: 'Arial'; font-weight: 700; font-size: 11pt; text-align: center; margin: 10px 0">
            Candidates <u>recommended not to proceed</u> and reasons why they are considered to meet the ASC
          </p>
        `);
      }

      writer.addRaw(`
        <table style="font-family: 'Arial'; font-size: 0.75rem;">
          <tbody>
            <tr>
              <td width="110" style="text-align:center;"><b>Professional Surname</b></td>
              <td width="100" style="text-align:center;"><b>Forename</b></td>
      `);

      if (currentStatus === config.APPLICATION.ELIGIBILITY_ISSUE_STATUS.PROCEED) {
        writer.addRaw(`
            <td style="text-align:center;">
              <b>Reasons ASC is demonstrated in some other significant way – Judicial Office Holders with less than the required sitting days at point of application
              </b>
            </td>
          </tr>
        `);
      } else {
        writer.addRaw(`
            <td style="text-align:center;">
              <b>Reasons ASC is not demonstrated in some other significant way</b>
            </td>
          </tr>
        `);
      }

      statusGroupARs.forEach((applicationRecord) => {
        const fullName = splitFullName(applicationRecord.application.personalDetails.fullName);
        const firstName = fullName[0] || '';
        const lastName = fullName[1] || '';
        const comment = getJudicialExperienceDetail(applicationRecord.application);
        const reason = applicationRecord.issues.eligibilityIssuesReason || '';
        writer.addRaw(`
          <tr>
            <td><b>${lastName}</b></td>
            <td>${firstName}</td>
            <td>
              <b>Candidate Comments:</b> ${comment}
              <br>
              <br>
              <b>Panel Comments (where applicable):</b>
              <br>
              <br>
              <b>JAC Comments (with reference to the ASC Log if appropriate):</b> ${reason}
              </td>
          </tr>
        `);
      });

      writer.addRaw(`
          </tbody>
        </table>
      `);
    });

    return writer.toString();

  }

  function addNewHtmlPage() {
    return `
      <hr class="pb">
      <p style="font-family: Arial; font-size: 10pt; text-align: center;"><b>OFFICIAL - SENSITIVE</b></p>
      <p style="font-family: Arial; font-size: 10pt; text-align: right; color: red;"><b>(JAC/SCC/xx/xxx)</b></p>
      <br>
    `;
  }

  function getDateString(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function getJudicialExperienceDetail(application) {
    if (application.feePaidOrSalariedJudge === true) {
      if (application.feePaidOrSalariedSittingDaysDetails) {
        return application.feePaidOrSalariedSittingDaysDetails;
      }
    }
    if (application.feePaidOrSalariedSatForThirtyDays === false || application.feePaidOrSalariedJudge === false) {
      if (application.declaredAppointmentInQuasiJudicialBody === true) {
        if (application.quasiJudicialSittingDaysDetails) {
          return application.quasiJudicialSittingDaysDetails;
        }
      }
    }
    if (application.declaredAppointmentInQuasiJudicialBody === false || application.quasiJudicialSatForThirtyDays === false) {
      return application.skillsAquisitionDetails;
    }
    return '';
  }

  /**
   * Dumps eligibility issues to the console, to assist with debugging
   *
   * @param {*} applicationRecords
   */
   function dumpEligibilityIssues(applicationRecords) {

    console.log('*** Dump - START ***');

    // dump a summary of all applications
    const filtered = applicationRecords.filter(ar => { // exclude applications with no eligibility issues
      return ar.issues && ar.issues.eligibilityIssues && ar.issues.eligibilityIssues.length > 0;
    });
    filtered.forEach((ar) => {
      console.log(ar.candidate.fullName);
      if (ar && ar.issues) {
        console.log(` - ${ar.issues.eligibilityIssuesStatus || 'unassigned'}`);
      }
    });

    console.log('*** Dump - END ***');
  }

  function splitFullName(fullName) {
    const name = fullName.split(' ');
    let firstName = null;
    let lastName = null;
    if (name.length > 1) {
      firstName = name[0];
      name.shift();
      lastName = name.join(' ');
    } else {
      firstName = '';
      lastName = name[0];
    }
    return ([firstName, lastName]);
  }
};

const eligibilityIssuesExport = (applicationRecords) => {
  return applicationRecords.map((applicationRecord) => {
    const application = applicationRecord.application;
    return {
      referenceNumber: _.get(applicationRecord, 'application.referenceNumber', null),
      fullName: _.get(applicationRecord,'candidate.fullName', null),
      email: _.get(applicationRecord, 'application.personalDetails.email', null),
      citizenship: _.get(applicationRecord, 'application.personalDetails.citizenship', null),
      dateOfBirth: formatDate(_.get(applicationRecord, 'application.personalDetails.dateOfBirth', null)),
      qualifications: formatQualifications(_.get(applicationRecord, 'application.qualifications', null)),
      postQualificationExperience: getPostQualificationExperienceString(application),
    };
  });
};

function formatQualifications(data) {
  if (data && data.length) {
    return data.map(qualification => {
      return [
        `${lookup(qualification.type)}`,
        `Date: ${formatDate(qualification.date)}`,
        `Location: ${lookup(qualification.location)}`,
      ].join(' - ');
    }).join('; \n');
  }
  return data;
}

function getPostQualificationExperienceString(application)
{
  if (!application.experience || application.experience.length === 0 ) {
    return '';
  } else {
    return application.experience.map((job) => {
      if (job.jobTitle) {
        return formatDate(job.startDate) + ' - ' + job.jobTitle + ' at ' + job.orgBusinessName;
      } else {
        return '';
      }
    }).join('\r\n\r\n\r\n').trim();
  }
}
