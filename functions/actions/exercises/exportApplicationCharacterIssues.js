import lookup from '../../shared/converters/lookup.js';
import * as helpers from '../../shared/converters/helpers.js';
import { getDocuments, getDocument, formatDate, getDate, splitFullName } from '../../shared/helpers.js';
import { applicationOpenDatePost01042023, ordinal, getJudicialExperienceString } from '../../shared/converters/helpers.js';
import _ from 'lodash';
import htmlWriter from '../../shared/htmlWriter.js';
import { APPLICATION } from '../../shared/constants.js';
import initDrive from '../../shared/google-drive.js';

const drive = initDrive();

export default (firebase, db) => {
  return {
    exportApplicationCharacterIssues,
  };

  /**
   * Initialise the Google Drive service and return the folder ID for the specified folder
   *
   * @param   {string} folderName
   * @returns {string} The folder ID
   */
  async function initialiseGoogleDriveFolder(folderName = 'Character Export') {
    // get drive service
    await drive.login();

    // get settings and apply them
    const settings = await getDocument(db.collection('settings').doc('services'));
    drive.setDriveId(settings.google.driveId);

    // make sure a destination folder exists to create the file in
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

    return folderId;
  }

  async function exportApplicationCharacterIssues(exerciseId, stage, status, format) {

    // get the exercise
    const exercise = await getDocument(
      db.collection('exercises').doc(exerciseId)
    );

    // get applicationRecords
    let firestoreRef = db.collection('applicationRecords')
      .where('exercise.id', '==', exerciseId)
      .where('flags.characterIssues', '==', true);
    if (stage !== 'all') {
      firestoreRef = firestoreRef.where('stage', '==', stage);
    }
    if (status !== 'all') {
      firestoreRef = firestoreRef.where('status', '==', status === 'blank' ? '' : status);
    } else {
      firestoreRef = firestoreRef.where('status', '!=', 'withdrewApplication');
    }
    const applicationRecords = await getDocuments(firestoreRef);

    // add applications
    for (let i = 0, len = applicationRecords.length; i < len; i++) {
      const applicationRecord = applicationRecords[i];
      applicationRecords[i].application = await getDocument(
        db.collection('applications').doc(applicationRecord.application.id)
      );
    }

    // generate the export (to Google Doc)
    if (format === 'googledoc') {
      return exportToGoogleDoc(exercise, applicationRecords);
    } else if (format === 'annex') {
      return await exportCharacterAnnexReport(exercise, applicationRecords);
    }

    // get report rows
    const {
      maxCharacterInformationNum,
      maxProfessionalBackgroundNum,
      maxQualificationNum,
      maxPostQualificationExperienceNum,
      data: rows,
    } = getRows(exercise, applicationRecords);
    // get report headers
    const headers = getHeaders(exercise, maxCharacterInformationNum, maxProfessionalBackgroundNum, maxQualificationNum, maxPostQualificationExperienceNum);

    // return data for export (to Excel)
    return {
      total: applicationRecords.length,
      createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      headers,
      rows,
    };

  }

  /**
   * Exports character issues to a Google Docs file
   *
   * @param {*} applicationRecords
   * @returns
   */
  async function exportToGoogleDoc(exercise, applicationRecords) {
    // generate a filename for the document we are going to create
    const timestamp = (new Date()).toISOString();
    const filename = exercise.referenceNumber + '_' + timestamp;

    // initialise the Google Drive folder
    const folderId = await initialiseGoogleDriveFolder('Character Export');

    // Create character issues document
    await drive.createFile(filename, {
      folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent: getHtmlCharacterIssues(exercise, applicationRecords),
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    // return the path of the file to the caller
    return {
      path: folderName + '/' + filename,
    };

  }

  /**
   * Export character annex report to a Google Docs file and return the base64 encoded file
   *
   * @param   {object} exercise
   * @param   {object} applicationRecords
   * @returns {string} base64 encoded file
   */
  async function exportCharacterAnnexReport(exercise, applicationRecords) {
    // generate a filename for the document we are going to create
    const timestamp = (new Date()).toISOString();
    const filename = exercise.referenceNumber + '_Character Annex Report_' + timestamp;

    // initialise the Google Drive folder
    const folderId = await initialiseGoogleDriveFolder('Character Export');

    // Create character annex report document
    const fileId = await drive.createFile(filename, {
      folderId,
      sourceType: drive.MIME_TYPE.HTML,
      sourceContent: getHtmlCharacterAnnexReport(exercise, applicationRecords),
      destinationType: drive.MIME_TYPE.DOCUMENT,
    });

    if (fileId) {
      return await drive.exportFile(fileId, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    return false;
  }

  function getHeaders(exercise, maxCharacterInformationNum, maxProfessionalBackgroundNum, maxQualificationNum, maxPostQualificationExperienceNum) {
    let headers = [
      { title: 'Ref', ref: 'ref' },
      { title: 'Name', ref: 'name' },
      { title: 'Middle name(s)', ref: 'middleNames' },
      { title: 'Suffix', ref: 'suffix' },
      { title: 'Previous known name(s)', ref: 'previousNames' },
      { title: 'Professional name', ref: 'professionalName' },
      { title: 'Email', ref: 'email' },
      { title: 'Phone', ref: 'phone' },
      { title: 'Date of Birth', ref: 'dob' },
      { title: 'NI Number', ref: 'nationalInsuranceNumber' },
      { title: 'Citizenship', ref: 'citizenship '},
      { title: 'Reasonable Adjustments', ref: 'reasonableAdjustments' },
      ...getCharacterInformationHeaders(maxCharacterInformationNum),
      { title: 'Agreed to share data', ref: 'shareData' },
      ...getProfessionalBackgroundHeaders(maxProfessionalBackgroundNum),
      { title: 'Current legal role', ref: 'currentLegalRole' },
      { title: 'Held fee-paid judicial role', ref: 'feePaidJudicialRole' },
      { title: 'Attended Oxbridge universities', ref: 'oxbridgeUni' },
      { title: 'First generation to go to university', ref: 'firstGenerationStudent' },
      { title: 'Occupation of main household earner', ref: 'occupationOfChildhoodEarner' },
      { title: 'Either parent attended university to gain a degree', ref: 'parentsAttendedUniversity' },
      { title: 'Ethnic group', ref: 'ethnicGroup' },
      { title: 'Gender', ref: 'gender' },
      { title: 'Gender is the same as sex assigned at birth', ref: 'changedGender' },
      { title: 'Sexual orientation', ref: 'sexualOrientation' },
      { title: 'Disability', ref: 'disability' },
      { title: 'Religion or faith', ref: 'religionFaith' },
      { title: 'Attended Outreach events', ref: 'attendedOutreachEvents'},
      { title: 'Participated in a Judicial Workshadowing Scheme', ref: 'participatedInJudicialWorkshadowingScheme' },
      { title: 'Participated in Pre-Application Judicial Education programme', ref: 'hasTakenPAJE' },
      { title: 'Location Preferences', ref: 'locationPreferences' },
      { title: 'Jurisdiction Preferences', ref: 'jurisdictionPreferences' },
      ...getQualificationHeaders(maxQualificationNum),
      ...getPostQualificationExperienceHeaders(maxPostQualificationExperienceNum),
      { title: 'Judicial Experience', ref: 'judicialExperience' },
    ];

    // Add a column based on whether it's pre/post 01-04-2023
    let addColumn;
    if (applicationOpenDatePost01042023(exercise)) {
      addColumn = { title: 'Attended state or fee-paying school', ref: 'stateOrFeeSchool16' };
    }
    else {
      addColumn = { title: 'Attended state or fee-paying school', ref: 'stateOrFeeSchool' };
    }
    const index = headers.findIndex((header) => header.name === 'feePaidJudicialRole');
    if (index > -1) headers.splice(index, 0, addColumn);
    return headers;
  }

  function getRows(exercise, applicationRecords) {
    let maxCharacterInformationNum = 0;
    let maxProfessionalBackgroundNum = 0;
    let maxQualificationNum = 0;
    let maxPostQualificationExperienceNum = 0;

    const data = applicationRecords.map((applicationRecord) => {
      const application = applicationRecord.application;

      let characterIssues = [];
      // check if candidate has completed the section
      if (
        application.progress &&
        application.progress.characterInformation &&
        (application.characterInformation || application.characterInformationV2 || application.characterInformationV3)
      ) {
        characterIssues = applicationRecord.issues.characterIssues || [];
      }

      let professionalBackgrounds = [];
      if (application.equalityAndDiversitySurvey) {
        professionalBackgrounds = application.equalityAndDiversitySurvey.professionalBackground || [];
      }

      const qualifications = application.qualifications || [];
      const postQualificationExperiences = application.experience || [];

      maxCharacterInformationNum = characterIssues.length > maxCharacterInformationNum ? characterIssues.length : maxCharacterInformationNum;
      maxProfessionalBackgroundNum = professionalBackgrounds.length > maxProfessionalBackgroundNum ? professionalBackgrounds.length : maxProfessionalBackgroundNum;
      maxQualificationNum = qualifications.length > maxQualificationNum ? qualifications.length : maxQualificationNum;
      maxPostQualificationExperienceNum = postQualificationExperiences.length > maxPostQualificationExperienceNum ? postQualificationExperiences.length : maxPostQualificationExperienceNum;

      return {
        ref: _.get(applicationRecord, 'application.referenceNumber', ''),
        name: _.get(applicationRecord,'candidate.fullName', ''),
        middleNames: _.get(applicationRecord, 'application.personalDetails.middleNames', ''),
        suffix: _.get(applicationRecord, 'application.personalDetails.suffix', ''),
        previousNames: _.get(applicationRecord, 'application.personalDetails.previousNames', ''),
        professionalName: _.get(applicationRecord, 'application.personalDetails.professionalName', ''),
        email: _.get(applicationRecord, 'application.personalDetails.email', ''),
        phone: _.get(applicationRecord, 'application.personalDetails.phone', ''),
        dob: formatDate(_.get(applicationRecord, 'application.personalDetails.dateOfBirth', ''), 'DD/MM/YYYY'),
        nationalInsuranceNumber: _.get(applicationRecord, 'application.personalDetails.nationalInsuranceNumber', ''),
        citizenship: _.get(applicationRecord, 'application.personalDetails.citizenship', ''),
        reasonableAdjustments: _.get(applicationRecord, 'application.personalDetails.reasonableAdjustmentsDetails', ''),
        ...getCharacterInformation(characterIssues),
        ...getProfessionalBackgrounds(application.equalityAndDiversitySurvey),
        ...getEqualityAndDiversityData(exercise, application),
        locationPreferences: getLocationPreferencesString(application),
        jurisdictionPreferences: getJurisdictionPreferencesString(application),
        ...getQualifications(qualifications),
        ...getPostQualificationExperiences(postQualificationExperiences),
        judicialExperience: getJudicialExperienceString(exercise, application),
      };
    });

    return {
      maxCharacterInformationNum,
      maxProfessionalBackgroundNum,
      maxQualificationNum,
      maxPostQualificationExperienceNum,
      data,
    };
  }

  function getCharacterInformationHeaders(n) {
    const headers = [];
    for (let i = 1; i <= n; i++) {
      headers.push(
        { title: `${ordinal(i)} Character information`, ref: `characterInformation${i}` }
      );
    }
    return headers;
  }

  function getProfessionalBackgroundHeaders(n) {
    const headers = [];
    for (let i = 1; i <= n; i++) {
      headers.push(
        { title: `${ordinal(i)} Professional background`, ref: `professionalBackground${i}` }
      );
    }
    return headers;
  }

  function getQualificationHeaders(n) {
    const headers = [];
    for (let i = 1; i <= n; i++) {
      headers.push(
        { title: `${ordinal(i)} Qualification`, ref: `qualification${i}` }
      );
    }
    return headers;
  }

  function getPostQualificationExperienceHeaders(n) {
    const headers = [];
    for (let i = 1; i <= n; i++) {
      headers.push(
        { title: `${ordinal(i)} Post-qualification experience`, ref: `postQualificationExperience${i}` }
      );
    }
    return headers;
  }

  function getEqualityAndDiversityData (exercise, application) {
    const survey = application.equalityAndDiversitySurvey;
    if (!survey) return {};

    let formattedFeePaidJudicialRole;
    if (survey.shareData) {
      formattedFeePaidJudicialRole = helpers.toYesNo(lookup(survey.feePaidJudicialRole));
      if (survey.feePaidJudicialRole === 'other-fee-paid-judicial-office') {
        formattedFeePaidJudicialRole = `${formattedFeePaidJudicialRole}\n${survey.otherFeePaidJudicialRoleDetails}`;
      }
    }

    const formattedDiversityData = {
      shareData: helpers.toYesNo(survey.shareData),
      currentLegalRole: helpers.flattenCurrentLegalRole(application.equalityAndDiversitySurvey),
      formattedFeePaidJudicialRole: formattedFeePaidJudicialRole || null,
      stateOrFeeSchool: lookup(survey.stateOrFeeSchool),
      oxbridgeUni: helpers.toYesNo(survey.oxbridgeUni),
      firstGenerationStudent: helpers.toYesNo(lookup(survey.firstGenerationStudent)),
      occupationOfChildhoodEarner: lookup(survey.occupationOfChildhoodEarner),
      parentsAttendedUniversity: lookup(survey.parentsAttendedUniversity),
      ethnicGroup: lookup(survey.ethnicGroup),
      gender: lookup(survey.gender),
      changedGender: helpers.toYesNo(survey.changedGender),
      sexualOrientation: lookup(survey.sexualOrientation),
      disability: survey.disability ? survey.disabilityDetails : helpers.toYesNo(survey.disability),
      religionFaith: lookup(survey.religionFaith),
      attendedOutreachEvents : helpers.toYesNo(lookup(survey.attendedOutreachEvents)),
      participatedInJudicialWorkshadowingScheme : 'No', // default (see below)
      hasTakenPAJE : 'No', // default (see below)
    };

    if (exercise.typeOfExercise === 'legal' || exercise.typeOfExercise === 'leadership') {
      formattedDiversityData.participatedInJudicialWorkshadowingScheme = helpers.toYesNo(lookup(survey.participatedInJudicialWorkshadowingScheme));
      formattedDiversityData.hasTakenPAJE = helpers.toYesNo(lookup(survey.hasTakenPAJE));
    }

    return formattedDiversityData;
  }

  function getLocationPreferencesString(application)
  {
    if (!application.locationPreferences) {
      return '';
    }
    if (Array.isArray(application.locationPreferences)) {
      return application.locationPreferences.join('\r\n');
    }
    return application.locationPreferences;
  }

  function getJurisdictionPreferencesString(application)
  {
    if (!application.jurisdictionPreferences) {
      return '';
    }
    if (Array.isArray(application.jurisdictionPreferences)) {
      return application.jurisdictionPreferences.join('\r\n');
    }
    return application.jurisdictionPreferences;
  }

  function getQualifications(qualifications) {
    const data = {};
    for (let i = 0; i < qualifications.length; i++) {
      const qualification = qualifications[i];

      const index = i + 1;
      if ((typeof qualification.type === 'undefined' || qualification.type === null)  || typeof qualification.date === 'undefined') {
        continue;
      }
      let description = `${qualification.type.toUpperCase()} - ${formatDate(qualification.date, 'DD/MM/YYYY')} \r\n`;
      if (qualification.location) {
        description = description + qualification.location.replace('-', '/').toUpperCase() + ' \r\n';
      }
      if (qualification.calledToBarDate) {
        description = description + `Called to the bar: ${formatDate(qualification.calledToBarDate, 'DD/MM/YYYY')} \r\n`;
      }
      if (qualification.details) {
        description = description + `${qualification.details} \r\n`;
      }
      data[`qualification${index}`] = description;
    }
    return data;
  }

  function getCharacterInformation(characterIssues) {
    const data = {};
    for (let i = 0; i < characterIssues.length; i++) {
      const issue = characterIssues[i];
      if (!issue.events || issue.events.length === 0) continue;
      const index = i + 1;
      data[`characterInformation${index}`] = issue.events.map((event) => {
        let investigations = '';
        if (event.investigations !== null && event.investigations !== undefined) {
          investigations = `Investigation ongoing: ${helpers.toYesNo(event.investigations)}\r\n`;
        }
        if (event.investigations === true && event.investigationConclusionDate) {
          const prettyDate = getDate(event.investigationConclusionDate).toJSON().slice(0, 10).split('-').reverse().join('/'); // dd/mm/yyyy
          investigations = investigations.concat(`Investigation conclusion date: ${prettyDate}\r\n`);
        }

        return `${issue.summary.toUpperCase()}\r\n${event.category || ''}\r\n${swapDY(formatDate(event.date, 'DD/MM/YYYY'))} - ${event.title || ''}\r\n${investigations}${event.details}`;
      }).join('\r\n\r\n\r\n').trim();
    }
    return data;
  }

  function getProfessionalBackgrounds(equalityAndDiversitySurvey) {
    if (!(equalityAndDiversitySurvey && equalityAndDiversitySurvey.professionalBackground)) return {};

    const data = {};
    for (let i = 0; i < equalityAndDiversitySurvey.professionalBackground.length; i++) {
      const role = equalityAndDiversitySurvey.professionalBackground[i];
      const index = i + 1;
      if (role === 'other-professional-background') {
        data[`professionalBackground${index}`] = `Other: ${ equalityAndDiversitySurvey.otherProfessionalBackgroundDetails }`;
      } else {
        data[`professionalBackground${index}`] = lookup(role);
      }
    }
    return data;
  }

  function swapDY(d) {
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function getPostQualificationExperiences(postQualificationExperiences) {
    const data = {};
    for (let i = 0; i < postQualificationExperiences.length; i++) {
      const experience = postQualificationExperiences[i];
      const index = i + 1;
      if (experience.jobTitle) {
        data[`postQualificationExperience${index}`] =
          `${formatDate(experience.startDate, 'MMM YYYY')} - ${formatDate(experience.endDate, 'MMM YYYY') || 'Ongoing'} ${experience.jobTitle} at ${experience.orgBusinessName}`;
      }
    }
    return data;
  }

  /**
   * Generates the Character Issues report, in HTML format
   *
   * @param {*} exercise
   * @param {*} applicationRecords
   * @returns
   */
  function getHtmlCharacterIssues(exercise, applicationRecords) {

    let writer = new htmlWriter();

    addHtmlCharacterIssues_FrontPage(writer, exercise);
    writer.addPageBreak();
    addHtmlCharacterIssues_ContentsPage(writer);
    writer.addPageBreak();
    addHtmlCharacterIssues_Proposal(writer);
    writer.addPageBreak();
    addHtmlCharacterIssues_CandidatesDeclarations(writer, applicationRecords);
    writer.addPageBreak();
    addHtmlCharacterIssues_MainBody(writer, exercise, applicationRecords);
    writer.addPageBreak();
    addHtmlCharacterIssues_MeritOrder(writer, applicationRecords);
    writer.addPageBreak();
    addHtmlCharacterIssues_PanelsComposition(writer);
    writer.addPageBreak();
    addHtmlCharacterIssues_RemainingOnS94List(writer, applicationRecords);
    writer.addPageBreak();
    addHtmlCharacterIssues_PanelReports(writer);
    writer.addPageBreak();
    addHtmlCharacterIssues_StatConLetters(writer);
    writer.addPageBreak();
    writer.addPageBreak(); // there is a blank page before the next section
    addHtmlCharacterIssues_SelectionExercise(writer, exercise);
    writer.addPageBreak();
    addHtmlCharacterIssues_AppointmentsVacancyRequest(writer);
    writer.addPageBreak();
    addHtmlCharacterIssues_DiversityStatistics(writer);

    return writer.toString();

  }

  /**
   * Adds the front page to the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} exercise
   * @returns void
   */
  function addHtmlCharacterIssues_FrontPage(writer, exercise) {

    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    addOfficialSensitive(writer);
    writer.addRaw(`
<div class="full-page" style="font-weight: 700; text-align: center;">
  <div style="margin-top: 30px;">
    <img style="width: 1.17in; height: 1.05in" src="data:image/jpeg;base64,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" />
  </div>
  <h3 style="font-size: 11pt; margin-top: 120px;">Selection and Character Committee</h3>
  <p style="margin-top: 13px;">${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}</p>
  <h3 style="font-size: 11pt; margin-top: 28px;">
    Proposal Paper<br>
    Character and Selection Decisions<br>
    For
  </h3>
  <p style="margin-top: 13px;">${exercise.referenceNumber} - ${exercise.name}</p>
  <div style="margin-top: 210px; text-align: left;">
    <p>Assigned Commissioner: <span class="red">INSERT NAME</span></p>
    <p style="margin-top: 13px;">Senior Selection Exercise Manager: <span class="red">INSERT NAME</span></p>
    <p style="margin-top: 13px;">Selection Exercise Manager: <span class="red">INSERT NAME</span></p>
  </div>
</div>
  `);

  }

  /**
   * Adds the main body content of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_ContentsPage(writer) {
    addOfficialSensitive(writer);
    writer.addRaw(`
<div>
  <p><b>
    <u>Contents</u>
    <span class="red"><i>
      (Please ensure that if the contents of the agenda change, the relevant sections should be added to the Contents section along with hyperlinks.
      If referencing a panel report, please also ensure that a link is added to the reference))
    </i></span>
  </b></p>
  <br>
  <p><a href="#summary">Summary</a></p>
  <p><a href="#declaration-of-interest">Declaration of Interest</a></p>
  <p><a href="#conflict-of-interest">Conflict of Interest</a></p>
  <p><a href="#salaried-part-time-working">Salaried Part Time Working</a> <b class="red">(delete if not available)</b></p>
  <p><a href="#character">Character</a></p>
  <p><a href="#statutory-consultation">Statutory Consultation</a></p>
  <p><a href="#selection-recommendation">Selection Recommendation</a></p>
  <p><a href="#equal-merit-provision">Equal Merit Provision</a></p>
  <p><a href="#selection-criteria">Selection Criteria</a></p>
  <p><a href="#diversity-monitoring">Diversity Monitoring</a></p>
  <p class="red"><b>(Add Annexes)</b></p>
</div>
  `);
  }


  /**
   * Adds the main body content of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_Proposal(writer) {
    addOfficialSensitive(writer);
    writer.addHeading('Commission Proposal Paper');
    writer.addHeadingRaw('<a name="summary">Summary</a>');
    writer.addRaw(`
<ol>
  <li>
    <b><span class="red">&lt;insert if calling from s94 list&gt;</span></b> This paper provides detail of the selection exercise to select a total of
    <b class="red">insert number</b> candidates for the office of
    <b class="red">insert office</b> under s87 of the Constitutional Reform Act 2005 (CRA). These candidates will be drawn from the section 94 list created on
    <b class="red">insert date</b>.
    <span class="red"><b>&lt;insert if necessary: </b>This total figure includes <b>insert number</b> vacancies to replace candidates who were originally
    selected in <b>insert month</b>, <b>insert year</b>, but who have declined the offer of appointment.<b class="red">&gt;</b></span>
  </li>
</ol>
    `);
    writer.addHeading('OR');
    writer.addRaw(`
<ol start="2">
  <li>
    <b class="red">&lt;insert if a s87 exercise only&gt;</b> The Judicial Appointments Commission (JAC) has been asked to select candidates
    to fill a total of <b class="red">insert number</b> posts for the office of <b class="red">insert post</b> under s87 of the Constitutional Reform Act 2005 (CRA).
    These candidates are for immediate appointment.
  </li><br>
  <li>
    The vacancies arise from the following <b class="red">insert circuit/location</b> (<b class="red">insert number of vacancies</b>):
    <p>
      <ul>
        <li>Location 1 (<b class="red">insert number</b>)</li>
        <li>Location 2 (<b class="red">insert number</b>)</li>
        <li>Location 3 (<b class="red">insert number</b>)</li>
      </ul>
    </p>
  </li><br>
  <li>
    The exercise launched on <b class="red">insert date</b> and closed for applications on <b class="red">insert date</b>. A total of <b class="red">insert number</b> applications were received with
    <b class="red">insert number</b> candidates withdrawing during the course of this exercise.
  </li><br>
  <li>
    <b class="red">Insert number</b> candidates were invited to selection day<span class="red">/s</span>. Selection day<span class="red">/s</span> took place
    <b class="red">on/between</b> <b class="red">insert date</b> at the JAC
    <b>OR</b><span class="red"><b> &lt;insert if appropriate:</b> across <b>insert number</b> regional venues.<b>&gt;</b>
  </li><br>
  <li>
    <b><span class="red">&lt;Insert if appropriate:</span></b> If SCC selects <b class="red">insert number</b> candidates, <b class="red">insert number</b> will remain on the s94 list.
    Currently we <span class="red">[do/do not]</span> expect further requests for recommendations throughout the year.<b class="red">&gt;</b>
  </li>
</ol>
    `);

    writer.addHeading('OR');
    writer.addRaw(`
<ol start="7">
  <li>
    <b><span class="red">&lt;Insert if appropriate:</span></b> The Commission will wish to note that we are only able to recommend candidates for <b class="red">insert number</b> of the
    <b class="red">insert number</b> posts.<b><span class="red">&gt;</span></b>
  </li><br>
  <li>
    <b class="red">&lt;Insert if appropriate: Include any other key information/issues that Commissioners need to be aware of when considering
    the recommendations.&gt;</b>
  </li>
</ol>
    `);

    writer.addHeadingRaw('<a name="declaration-of-interest">Declaration of Interest</a>');
    writer.addRaw(`
<ol start="9">
  <li>
    <span class="red"><b>State any declarations of interest (if numerous state number and detail into Annex &lt;insert hyperlink to Annex&gt;). OR: </b></span>
    There are no declarations of interest made by the candidates discussed in this paper.
  </li>
</ol>
  `);

    writer.addHeadingRaw('<a name="conflict-of-interest">Conflict of Interest</a>');
    writer.addRaw(`
<ol start="10">
  <li>
    <span class="red"><b>Include any conflict of interest that was discussed in accordance with the Guidance on individuals undertaking multiple roles on a selection exercise OR:
    </b></span>There were no individuals (i.e. panel members or judges) undertaking more than one role in this selection exercise.
  </li>
</ol>
    `);

    writer.addRaw('<h4><a name="salaried-part-time-working">Salaried Part-time Working</a> <span class="red">&lt;</span>delete if not applicable<span class="red">&gt;</span></h4>');
    writer.addRaw(`
<ol start="11">
  <li>
    <span class="red"><b>State the number of posts which could be considered for a SPTW pattern and if any expressed this as a preference. Consider whether there might be a
    shortfall in FTE terms and, if so, explain that we might be asked to consider selectable candidates beneath the line following deployment by the judiciary if there is a
    shortfall in FTE terms OR:</b></span>
    None of the roles were considered suitable for part-time working. This is because <b class="red">insert explanation</b>.
  </li>
</ol>
  `);

    writer.addHeadingRaw('<a name="character">Character</a>');
    writer.addRaw(`
<ol start="12">
  <li>
    We have carried out all the relevant character checks and <b class="red">[no/the following]</b> issues have been identified(.) <b>OR</b> (:)
    <ul>
      <li>Candidates whose character issues require a character decision (<b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>)</li>
      <li>Candidates recommended to proceed as character issues previously decided (<b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>)</li>
    </ul>
  </li>
</ol>
  `);

    writer.addHeading('OR – for call-offs from the s94 list');
    writer.addRaw(`
<ol start="13">
  <li>
    All character declarations were considered by the Committee when the list was created. We have refreshed the character checks and
    <b><span class="red">&lt;insert if appropriate:</span></b> no further issues have been identified.<b><span class="red">&gt; OR briefly state any issues</span></b>
  </li>
</ol>
`   );

    writer.addHeadingRaw('<a name="statutory-consultation">Statutory Consultation</a>');
    writer.addRaw(`
<ol start="14">
  <li>
    The <b class="red">insert first consultee</b> and <b class="red">insert second consultee</b> were consulted on <b class="red">insert date</b>
    about <b class="red">insert number</b> candidates for selection. A copy of the responses is at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.
  </li><br>
  <li>
    In considering the statutory consultation responses, the following candidate<span class="red">/s</span> <span class="red">is/are</span> of note:
    <p>
      <ul>
        <li><b class="red">insert name: insert comments / concerns</b>
        <li><b class="red">insert name: insert comments / concerns</b>
        <li><b class="red">insert name: insert comments / concerns</b>
      </ul>
    </p>
  </li>
</ol>
    `);

    writer.addHeadingRaw('<a name="selection-recommendation">Selection Recommendation</a>');
    writer.addRaw(`
<ol start="16">
  <li>
    <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b> details all the candidates assessed at selection day and sets out the candidates we are proposing for
    recommendation, in merit order <b class="red">&lt;insert if appropriate: for each location&gt;</b>.
  </li><br>
  <li>
    The order of merit was agreed at moderation and <b class="red">&lt;insert as appropriate: no changes have been made since&gt;</b>.
    <b class="red">&lt;Please explain here how the merit list was prepared: you should include the following:</b>
    <p>
      <ul>
        <span class="red"><b>
          <li>how the merit list order was arrived at;</li>
          <li>on what basis it is ordered (if any numerical or other system has been used);</li>
          <li>which elements of it were agreed and discussed at moderation (including which candidates were discussed)</li>
          <li>if any changes have been made since it was agreed at moderation – why?</li>
        </b></span>
      </ul>
    </p>
    <span class="red"><b>Please ensure the merit list is clearly annotated to indicate the points mentioned above&gt;</b></span>
  </li>
</ol>
    `);
    writer.addHeading('OR');
    writer.addRaw(`
<ol start="18">
  <li>
    <span class="red"><b>&lt;insert paragraph for call-off exercises:</b> The candidates who remain on the section 94 list can be found at
    <b>Annex X</b> <b>&lt;insert hyperlink to Annex&gt;</b>. This annex details both the candidates being considered and those not being considered
    on this occasion due to the current location/s or particular working patterns.<b>&gt;</b></span>
  </li><br>
  <li>
    The panel reports for all candidates <b class="red">[recommended/considered]</b> are included at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.
    Independent assessments for all candidates will be available on the day.
  </li><br>
  <li>
    Panel reports and independent assessments for all candidates will also be available on request.
  </li>
</ol>
    `);

    writer.addHeadingRaw('<a name="equal-merit-provision">Equal Merit Provision</a>');
    writer.addRaw(`
<ol start="21">
  <li>
    <b><span class="red">&lt;Please explain here how the zone of Equal Merit was created OR why there is no zone of equal merit&gt;</span></b>
  </li><br>
  <li>
    Taking into consideration the above points we recommend that <b class="red">insert name</b> is demonstrably more meritorious than the other candidates.
  </li>
</ol>
    `);

    writer.addHeading('OR');
    writer.addRaw(`
<ol start="23">
  <li>
    Therefore, we propose that there is no zone to be considered for the application of the equal merit provision.
  </li><br>
  <li>
    <b><span class="red">DN – If more than one jurisdiction/merit list please explain why no EM zone was considered for each jurisdiction/merit list. Discuss Equal Merit wording with
    the Head of Equality and Diversity if necessary.</span></b>
  </li>
</ol>
    `);

    writer.addHeadingRaw('<a name="selection-criteria">Selection Criteria</a> / Criterion <span class="red">&lt;delete as appropriate&gt;</span>');
    writer.addRaw(`
<ol start="25">
  <li>
    The additional selection <b class="red">[criteria/criterion]</b> for this exercise were:
  </li><br>
  <li>
    <b><span class="red">&lt;insert if/as appropriate:</span></b> Candidates to have previous judicial experience, sitting as a judge in a salaried or fee-paid capacity
    or a similar role such as the chair of an equivalent body for which a legal qualification is required.
  </li><br>
  <li>
    An equivalent body is one of a quasi-judicial nature for which the powers and procedures should resemble those of a court of law and involve highly complex matters,
    requiring its members objectively to determine the facts and draw conclusions to reach a reasoned decision.  Such decisions could result in the imposition of a penalty,
    and they are likely to affect the legal rights, duties or privileges of specific parties.  Examples could include, but are not restricted to:
    <p>A. Coroner</p>
    <p>B. Disciplinary tribunals and conduct hearings for professional standards bodies</p>
    <p>C. Arbitration</p>
    <p>D. Parole Board</p>
    <p>E. Chair of a statutory inquiry</p>

    <p>The length of judicial experience required is a minimum of 30 completed sitting days since appointment, not including training or sick days.</p>

    <p>Only in exceptional cases and if the candidate in question has demonstrated the necessary skills in some other significant way should an exception be made.</p>
  </li><br>
  <li>
    <span class="red"><b>&lt;Insert any other additional selection criteria if appropriate.&gt;</b></span>
  </li><br>
  <li>
    All recommended candidates met the additional selection <b class="red">[criteria/criterion]</b>.
  </li>
</ol>
  `);

    writer.addHeading('OR');
    writer.addRaw(`
<ol start="29">
  <li>
    <span class="red"><b>&lt;Insert where appropriate when judicial experience is an ASC:&gt;</b></span>
    At the SCC meeting on <b class="red">insert date of SCC eligibility meeting</b> the Commission determined <b class="red">insert number</b> candidates had
    demonstrated the skills in some other significant way and were allowed to progress to a selection day. The selection day panels explored this further and
    <b class="red">&lt;Please explain here how the panel were satisfied the candidate has the necessary skills&gt; OR This/These</b> candidate(s) were assessed
    at selection day as not being selectable; therefore, all of the candidates recommended in this paper have directly relevant previous judicial
    experience.<span class="red"><b>&gt;</b></span>
  </li><br>
  <li>
    The table at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b> contains the detail with regard to this selection exercise.
    A copy of the vacancy requests is attached at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.
    <b class="red">&lt;insert if appropriate: Copies of the qualifying test are attached at <b>Annex X</b> &lt;insert hyperlink to Annex&gt;.
    A full summary of, and the materials from, the selection day are at <b>Annex X </b>and <b>Y</b> &lt;insert hyperlink to Annexes&gt; respectively.
    The job description is at <b>Annex X</b> &lt;insert hyperlink to Annex&gt; and the competencies required for these posts are at
    <b>Annex X</b> &lt;insert hyperlink to Annex&gt;.</b>
  </li><br>
</ol>
    `);

    writer.addHeadingRaw('<a name="diversity-monitoring">Diversity Monitoring</a>');
    writer.addRaw(`
<ol start="31">
  <li>
    Diversity statistics relating to the candidates post the selection day moderation stage of the selection exercise are provided at
    <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.
  </li>
</ol>
    `);
  }

  /**
   * Adds the Candidates' Declarations section of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} applicationRecords
   */
  function addHtmlCharacterIssues_CandidatesDeclarations(writer, applicationRecords) {
    addOfficialSensitive(writer);
    writer.addRaw(`
<p style="text-align: center"><span class="red"><b>&lt;insert if too numerous for body of paper&gt;</b></span></p>
    `);
    writer.addHeading('Candidates\' Declarations', 'center');
    writer.addRaw(`
<table>
<tr>
  <td width="125px"><u>Candidate<br>Surname</u></td>
  <td width="125px"><u>Candidate<br>Forename</u></td>
  <td><u>Commissioner(s) known by candidate</u></td>
  <td><u>Declaration</u></td>
</tr>
    `);
    let firstIsDone = false;
    applicationRecords.forEach(ar => {
      if (ar.issues && ar.issues.characterIssues && ar.issues.characterIssues.length > 0) {
        const nameParts = ar.candidate.fullName.split(' ');
        const firstName = nameParts.shift();
        const lastName = nameParts.join(' ');
        writer.addRaw(`
<tr>
  <td>${firstName}</td>
  <td>${lastName}</td>
  <td></td>
  <td>${firstIsDone ? '' : '<span class="gray">i.e. how the candidate knows the Commissioner</span>'}</td>
</tr>
        `);
        firstIsDone = true;
      }
    });
    writer.addRaw(`
</table>
    `);
  }

  /**
   * Adds the main body content of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} exercise
   * @param {*} applicationRecords
   */
  function addHtmlCharacterIssues_MainBody(writer, exercise, applicationRecords) {

    // dumpCharacterIssues(applicationRecords);

    flattened = flattenApplicationRecords(applicationRecords);

    // dumpFlatRecords(flattened);

    groups = [
      'Single Motoring Offences',
      'Multiple Motoring Offences',
      'Single Financial Issues',
      'Multiple Financial Issues',
      'Single Professional Conduct',
      'Multiple Professional Conduct',
      'Single Criminal Offences',
      'Multiple Criminal Offences',
      'Mixed Issues',
    ];

    let candidateCount = 0;
    let firstStatusIsDone = false;

    Object.keys(APPLICATION.CHARACTER_ISSUE_STATUS).forEach((k) => {

      const currentStatus = APPLICATION.CHARACTER_ISSUE_STATUS[k];
      const statusText = k.split('_').join(' '); // i.e. REJECT_NON_DECLARATION becomes REJECT NON DECLARATION

      statusGroupARs = flattened.filter(ar => { // get applications with the character issue status we are processing
        return ar.status === currentStatus;
      });

      if (statusGroupARs.length === 0) { // no applications found
        return; // next iteration (skip this report group)
      }

      if (firstStatusIsDone) {
        writer.addPageBreak();
      }

      addOfficialSensitive(writer);
      writer.addHeading(`${exercise.referenceNumber} - CHARACTER ISSUES REQUIRING A DECISION: ${statusText}`, 'center', '1rem', 'margin:10px 0; padding:0;');

      writer.addRaw(`
<table style="font-size: 0.75rem;">
  <tbody>
    <tr><td width="50"><b>No.</b></td><td colspan="2" style="text-align:center;"><b>Detail</b></td></tr>
      `);

      groups.forEach(group => {

        // get the applications that have issues for the group we are processing
        issueGroupARs = getIssueGroupARs(statusGroupARs, group);

        if (issueGroupARs.length === 0) { // no applications found
          return; // next iteration (skip this report group)
        }

        writer.addRaw(`<tr><td colspan="3" style="text-align:center; background-color:#68b; padding:5px"><b>${group.toUpperCase()}</b></td></tr>`);
        issueGroupARs.forEach((ar, i) => {
          candidateCount++;
          if (i > 0) {
            writer.addRaw('<tr><td colspan="3" style="background-color:#ddd; padding:0">&nbsp</td></tr>');
          }
          let natureAndDateOfIssue = '';
          let declaration = '';
          ar.issues.forEach((issue, i) => {
            const prettyDate = getDate(issue.date).toJSON().slice(0, 10).split('-').reverse().join('/'); // dd/mm/yyyy
            const prettyType = getCharacterIssuePrettyType(issue);
            if (i > 0) {
              natureAndDateOfIssue += '<br>'  ;
              declaration += '<br>'  ;
            }
            natureAndDateOfIssue += `${prettyType} - ${prettyDate}`;
            declaration += `
  <p><b>${prettyType}</b></p>
  <p><b>Date:</b> ${prettyDate}</p>
  <p><b>Details:</b> ${issue.details || ''}<br>${issue.title || ''}</p>
            `;
          });
          writer.addRaw(`
    <tr><td rowspan="6" width="50"><b>${candidateCount}.</b></td><td width="175"><b>Name</b></td><td>${ar.name}</td></tr>
    <tr><td><b>Nature and date of issue</b></td><td>${natureAndDateOfIssue}</td></tr>
    <tr><td><b>Declaration</b></td><td>${declaration}</td></tr>
    <tr><td><b>Recommendation</b></td><td>${statusText}</td></tr>
    <tr><td><b>Guidance reference</b></td><td></td></tr>
    <tr><td><b>Reason for recommendation</b></td><td>${ar.statusReason || ''}</td></tr>
            `);
        });
      });

      writer.addRaw(`
  </tbody>
</table>
      `);

      firstStatusIsDone = true;

    });

  }

  /**
   * Adds official sensitive
   *
   * @param {htmlWriter} writer
   * @returns void
   */
    function addOfficialSensitive(writer) {
    writer.addHeading('OFFICIAL - SENSITIVE', 'center', '10pt', 'margin:10px 0; padding:0; color:gray;');
    writer.addHeading('(JAC/SCC/xx/xxx)', 'right', '10pt', 'padding:0; color:gray;');
  }

  /**
   * Dumps characters issues to the console, to assist with debugging
   *
   * @param {*} applicationRecords
   */
  // function dumpCharacterIssues(applicationRecords) {

  //   console.log('*** Dump - START ***');

  //   // dump a summary of all applications that have one or more character issues
  //   const filtered = applicationRecords.filter(ar => { // exclude applications with no character issues
  //     return ar.issues && ar.issues.characterIssues && ar.issues.characterIssues.length > 0;
  //   });
  //   filtered.forEach((ar) => {
  //     console.log(`${ar.candidate.fullName} - ${ar.issues.characterIssuesStatus || 'unassigned'}`);
  //     ar.issues.characterIssues.forEach((issue) => {
  //       console.log(` - ${issue.type} x ${issue.events.length}`);
  //     });
  //   });

  //   console.log('*** Dump - END ***');
  // }

  /**
   * Dumps flattened applications/characters issue records to the console, to assist with debugging
   *
   * @param {*} flattened
   */
  // function dumpFlatRecords(flattened) {
  //   console.log(JSON.stringify(flattened, null, 2));
  // }

  /**
   * Sometimes an application has multiple issues of the same type with a single event each
   * Sometimes an application has a single issue with multiple events.
   * This function flatten this into a simple list of issues
   *
   * @param {*} applicationRecords
   * @returns array
   */
  function flattenApplicationRecords(applicationRecords) {

    // sometimes an application has multiple issues of the same type with a single event each
    // sometimes an application has a single issue with multiple events.
    // flatten this into a simple list of issues

    let applications = [];

    applicationRecords.forEach(ar => {
      if (ar.issues && ar.issues.characterIssues && ar.issues.characterIssues.length > 0) {
        let application = {
          name: ar.candidate.fullName,
          status: ar.issues.characterIssuesStatus,
          statusReason: ar.issues.characterIssuesStatusReason,
          issues: [],
        };
        ar.issues.characterIssues.forEach(ci => {
          if (!ci.events) return;
          ci.events.forEach(e => {
            application.issues.push({
              date: e.date || ci.date,
              type: e.type || ci.type,
              title: e.title || ci.title,
              summary: e.summary || ci.summary,
              details: e.details || ci.details,
            });
          });
        });
        applications.push(application);
      }
    });

    return applications;

  }

  /**
   * Returns applications that meet the criteria for the specified group
   *
   * @param {*} flattened - flattened application records / character issues
   * @param {*} group - character issue group
   */
  function getIssueGroupARs(flattened, group) {

    switch(group) {

      case 'Single Motoring Offences':
        return flattened.filter(e => { // there is only 1 issue of the specified status and it is a motoring issue
          return e.issues.length === 1 && getCharacterIssueGroup(e.issues[0]) === 'Motoring';
        });

      case 'Multiple Motoring Offences':
        return flattened.filter(e => {
          return e.issues.length > 1 && e.issues.filter(e2 => { // all issues are motoring issues
            return getCharacterIssueGroup(e2) === 'Motoring';
          }).length === e.issues.length;
        });

      case 'Single Financial Issues':
        return flattened.filter(e => { // there is only 1 issue of the specified status and it is a financial issue
          return e.issues.length === 1 && getCharacterIssueGroup(e.issues[0]) === 'Financial';
        });

      case 'Multiple Financial Issues':
        return flattened.filter(e => {
          return e.issues.length > 1 && e.issues.filter(e2 => { // all issues are financial issues
            return getCharacterIssueGroup(e2) === 'Financial';
          }).length === e.issues.length;
        });

      case 'Single Professional Conduct':
        return flattened.filter(e => { // there is only 1 issue of the specified status and it is a professional issue
          return e.issues.length === 1 && getCharacterIssueGroup(e.issues[0]) === 'Professional';
        });

      case 'Multiple Professional Conduct':
        return flattened.filter(e => {
          return e.issues.length > 1 && e.issues.filter(e2 => { // all issues are professional issues
            return getCharacterIssueGroup(e2) === 'Professional';
          }).length === e.issues.length;
        });

      case 'Single Criminal Offences':
        return flattened.filter(e => { // there is only 1 issue of the specified status and it is a criminal issue
          return e.issues.length === 1 && getCharacterIssueGroup(e.issues[0]) === 'Criminal';
        });

      case 'Multiple Criminal Offences':
        return flattened.filter(e => {
          return e.issues.length > 1 && e.issues.filter(e2 => { // all issues are criminal issues
            return getCharacterIssueGroup(e2) === 'Criminal';
          }).length === e.issues.length;
        });

      case 'Mixed Issues':
        return flattened.filter(e => {
          return e.issues.length > 1 && // there are multiple issues and...
            e.issues.filter(e2 => { // at least one issue is not in the same group as the first issue
              return getCharacterIssueGroup(e2) !== getCharacterIssueGroup(e.issues[0]);
            }).length > 0;
        });

      default:
        return []; // shouldn't happen

    }

  }

  /**
   * Gets the group for the character issue
   *
   * @param {*} characterIssue
   *
   * @returns string
   */
   function getCharacterIssueGroup(characterIssue) {
    if (characterIssue.type) {
      if (Object.keys(APPLICATION.CHARACTER_ISSUES).includes(characterIssue.type)) {
        return APPLICATION.CHARACTER_ISSUES[characterIssue.type].group;
      } if (Object.keys(APPLICATION.CHARACTER_ISSUES_V2).includes(characterIssue.type)) {
        return APPLICATION.CHARACTER_ISSUES_V2[characterIssue.type].group;
      }
    }
    return '?';
  }

  /**
   * Gets the human-readable 'type' field for the given character issue
   *
   * @param {*} characterIssue
   *
   * @returns string
   */
  function getCharacterIssuePrettyType(characterIssue) {
    if (characterIssue.type) {
      if (Object.keys(APPLICATION.CHARACTER_ISSUES).includes(characterIssue.type)) {
        return APPLICATION.CHARACTER_ISSUES[characterIssue.type].title;
      } if (Object.keys(APPLICATION.CHARACTER_ISSUES_V2).includes(characterIssue.type)) {
        return APPLICATION.CHARACTER_ISSUES_V2[characterIssue.type].title;
      }
    }
    return '?';
  }

  /**
   * Adds the Candidates in Merit Order section of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} applicationRecords
   */
  function addHtmlCharacterIssues_MeritOrder(writer, applicationRecords) {
    writer.addHeading('CANDIDATES IN MERIT ORDER', 'center');
    writer.addHeading('(Recommended Candidates in Bold)', 'center');
    writer.addRaw(`
<p style="margin-top:50px">
<b>Candidates recommended for: <span class="red">insert name of post and circuit (if applicable)
insert number</span> vacancies - <span class="red">insert vacancy location details</span> suitable for <span class="red">&lt;insert as appropriate:</span> </b>
Full time/SPTW at 50:50.<b><span class="red">&gt;</span></b>
</p>

<p>
<b><span class="red">&lt;delete when complete:</span> ALL CANDIDATES SHOULD BE LISTED IN MERIT ORDER. IF SELECTIONS ARE FOR MORE THAN ONE CIRCUIT,
REPRODUCE THIS TABLE AS APPROPRIATE.<span class="red">&gt;</span></b>
</p>

<p>
<span class="red"><b>&lt;Please add a hyperlink in the Panel Assessment Page Reference Column to the Candidate's Panel Report&gt;</b></span>
</p>
     `);
    // commented out because htmlWriter does not support vertical text
//     writer.addRaw(`
// <table style="margin-top:50px">
// <tr>
//   <td>Professional<br>Surname</td>
//   <td>Forename</td>
//   <td class="vertical-text">Exercising Judgement</td>
//   <td class="vertical-text">Possessing and Building Knowledge</td>
//   <td class="vertical-text">Assimilating and Clarifying Information</td>
//   <td class="vertical-text">Working and Communicating with Others</td>
//   <td class="vertical-text">Managing Work Efficiently</td>
//   <td class="vertical-text">Leadership</td>
//   <td class="vertical-text">Overall Band</td>
//   <td class="vertical-text">Welsh Questions</td>
//   <td class="vertical-text">Welsh language</td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text"><span class="gray">insert location</span></td>
//   <td class="vertical-text">Statutory Consultation</td>
//   <td class="vertical-text">Panel Assessment</td>
//   <td class="vertical-text">Page Reference</td>
// </tr>
//     `);
    writer.addRaw(`
<table style="margin-top:50px">
<tr style="background-color:#eee">
  <td style="width:125px;">Surname</td>
  <td style="width:125px;">Forename</td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
  <td style="width:20px;" class="vertical-text"></td>
</tr>
    `);
    for(let x = 1; x <= 10; x++) {
      writer.addRaw(`
<tr>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
      `);
    }

    writer.addRaw(`
</table>
<table>
<tr><td style="border:none; padding:2px 0;">Key to Statutory Consultation:</td><td style="border:none; padding:2px 0;">&#10004; = positive</td></tr>
<tr><td style="border:none; padding:2px 0;"></td><td style="border:none; padding:2px 0;">X = negative</td></tr>
<tr><td style="border:none; padding:2px 0;"></td><td style="border:none; padding:2px 0;">M = mixed</td></tr>
</table>
<p style="margin-top: 25px;">Panel reports and independent assessments for all candidates will be available on request.</p>
    `);
  }


  /**
   * Adds the Candidates in Merit Order section of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} applicationRecords
   */
  function addHtmlCharacterIssues_PanelsComposition(writer) {
    writer.addHeading('Panels Composition', 'center');
    writer.addRaw(`
<table style="margin-top: 50px">
<tr><td><b>Panel</b></td><td><b>Chair</b></td><td><b>Judicial Member</b></td><td><b>Independent Member</b></td></tr>
<tr><td>Panel 1</td><td></td><td></td><td></td></tr>
<tr><td>Panel 2</td><td></td><td></td><td></td></tr>
<tr><td>Panel 3</td><td></td><td></td><td></td></tr>
<tr><td>Panel 4</td><td></td><td></td><td></td></tr>
<tr><td>Panel 5</td><td></td><td></td><td></td></tr>
<tr><td>Panel 6</td><td></td><td></td><td></td></tr>
</table>
    `);
  }

  /**
   * Adds the Candidates Remaining on S94 List section of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} applicationRecords
   */
   function addHtmlCharacterIssues_RemainingOnS94List(writer, applicationRecords) {
    writer.addHeading('CANDIDATES REMAINING ON S94 LIST', 'center');
    writer.addHeading('IN MERIT ORDER', 'center');
    writer.addHeading('CANDIDATES SHOULD BE LISTED IN MERIT ORDER', 'center', 'inherit', 'margin-top: 50px;');
    // commented out because htmlWriter does not support vertical text
//     writer.addRaw(`
// <table style="margin-top:30px">
// <tr>
//   <td>Surname</td>
//   <td>Forename</td>
//   <td class="vertical-text">Exercising Judgement</td>
//   <td class="vertical-text">Possessing and Building Knowledge</td>
//   <td class="vertical-text">Assimilating and Clarifying Information</td>
//   <td class="vertical-text">Working and Communicating with Others</td>
//   <td class="vertical-text">Managing Work Efficiently</td>
//   <td class="vertical-text">Leadership</td>
//   <td class="vertical-text">Welsh language</td>
//   <td class="vertical-text">Overall Band</td>
// </tr>
//     `);
    writer.addRaw(`
<table style="margin-top:30px">
<tr style="background-color:#eee">
  <td style="width:125px;">Surname</td>
  <td style="width:125px;">Forename</td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
  <td style="width:40px;" class="vertical-text"></td>
</tr>
    `);
    for(let x = 1; x <= 10; x++) {
      writer.addRaw(`
<tr>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
      `);
    }
    writer.addRaw(`
</table>
    `);
  }

  /**
   * Adds the Panel Reports section of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_PanelReports(writer) {
    writer.addRaw(`
<p style="text-align: center">
  <b><span class="red">&lt;</span>INSERT PANEL REPORTS HERE <i>(choose ‘Statutory Consultation’ export)</i> – should include pen portrait, self-assessment,
  independent assessments evaluation, final candidate evaluation and stat con comments where relevant<span class="red">&gt;</span></b>
</p>
    `);
    writer.addParagraph('PASTE HERE', 'center', '10pt', 'color:gray; margin-top: 50px;');
  }

  /**
   * Adds the Stat Con Letters section of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_StatConLetters(writer) {
    writer.addParagraph('PASTE THE SCANNED COPY OF STAT CON LETTERS HERE', 'center', '10pt', 'color:gray;');
  }

  /**
   * Adds the Selection Exercise section of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_SelectionExercise(writer, exercise) {
    writer.addHeading(`${exercise.name} Selection Exercise`, 'center');
    writer.addRaw(`
<table style="margin-top:50px">
<tr>
  <td style="text-align:center" width="250"><b>Selection Exercise Stage</b></td>
  <td style="text-align:center"><b>Detail</b></td>
</tr>
<tr>
  <td>Vacancy Request (VR)</td>
  <td>
    Received <b class="red">insert date</b>. Copy attached at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.
    <b class="red">insert number</b> vacancies for immediate appointment.  <b class="red">If a s94 insert details here</b>
  </td>
</tr>
<tr>
  <td>Advertisements</td>
  <td><b><span class="red">&lt;</span>State whether a composite advert used or specifics where this differs<span class="red">&gt;</span></b></td>
</tr>
<tr>
  <td>Number of applications received</td>
  <td>Exercise launched <b class="red">insert date</b> with <b class="red">insert number</b> applications received.
  </td>
</tr>
<tr>
  <td>Eligibility <b>&lt;only include if the Commission decided candidate(s) were ineligible to proceed&gt;</b></td>
  <td>
    The Commission decided that <b class="red">insert number</b> candidates<span class="red">/s as/were</span> ineligible and that their
    application<span class="red">/s should not be allowed to proceed.
  </td>
</tr>
<tr>
  <td>Shortlisting <b>&lt;Qualifying test/sift/telephone assessment&gt;</b></td>
  <td>
    <p>Date of Dry Run: <b class="red">insert date</b></p>
    <p class="red"><b>insert number of candidates who sat the test/TA</b></p>
    <p>Main date of <b class="red">test/sift/TA</b>: <b class="red">insert date</b></p>
    <p>The draft <b class="red">test/TA</b> was subject to equality proofing by independent consultants and internal quality assurance by the JAC Advisory Group.</p>
  </td>
</tr>
<tr>
  <td>Independent Assessment <b>&lt;obtained pre/post short listing&gt;</b></td>
  <td>
    <ul>
      <li><b class="red">insert number</b> professional independent assessor(s);
         <br>and
      <li><b class="red">insert number</b> judicial independent assessor(s)</li>
    </ul>
  </td>
</tr>
<tr>
  <td>
    Selection day<br>
    <b><span class="red">&lt;</span>insert tools used:</b><br>
    Role-play<br>
    Presentation<br>
    Situational questioning<br>
    Interview<b><span class="red">&gt;</b></span>
  </td>
  <td>
    <p>
      <b><span class="red">&lt;</span>insert if role play/situational questioning used<span class="red">&gt;</span></b>
      The draft role play/situational questioning was subject to equality proofing by independent consultants and internal quality assurance by the JAC Advisory Group
    </p>
    <p><b class="red">insert number</b> candidates were invited to attend the selection day.</p>
    <p>Moderation took place to ensure consistency between the selection panel<span class="red">/s</span>.</p>
    <p>A full summary of selection day activities is attached at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</b>.</p>
    <p>A copy of the materials provided to candidates at the selection day is attached at <b>Annex X</b> <b class="red">&lt;insert hyperlink to Annex&gt;</span>.</p>
  </td>
</tr>
<tr>
    <td>Final good character checks</td>
    <td>
      <p><b><span class="red">&lt;</span>delete and/or add as appropriate<span class="red">&gt;</span></b></p>
      <ul>
        <li>HM Revenue and Customs</li>
        <li>Police Checks</li>
        <li>The Bar Standards Board</li>
        <li>Institute of Legal Executives</li>
        <li>Solicitors Regulation Authority</li>
        <li>Judicial Conduct Investigations Office</li>
        <li>Insolvency Service</li>
        <li>Royal Institute Chartered Surveyors</li>
        <li>Intellectual Property Regulation Board</li>
      </ul>
    </td>
</tr>
</table>
    `);
  }

  /**
   * Adds the Appointments Vacancy Request section of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
  function addHtmlCharacterIssues_AppointmentsVacancyRequest(writer) {
    writer.addHeading('JUDICIAL APPOINTMENTS VACANCY REQUEST', 'center');
    writer.addParagraph('PASTE HERE', 'center', '10pt', 'color:gray; margin-top: 50px;');
  }

  /**
   * Adds the Diversity Statistics section of the Character Issues report
   *
   * @param {htmlWriter} writer
   */
   function addHtmlCharacterIssues_DiversityStatistics(writer) {
    writer.addHeading('Diversity Statistics', 'center');
    writer.addRaw(`
<p style="font-size:10pt;">
  <b><span class="red">&lt;Please insert the email received from the Diversity and Engagement Team in the final diversity checkpoint, i.e. post selection
  day moderation figures. You should include both the table and analysis&gt;</span></b>
</p>
    `);
  }

  /**
   * Generate the Character Annex report, in HTML format
   *
   * @param {*} exercise
   * @param {*} applicationRecords
   * @returns
   */
  function getHtmlCharacterAnnexReport(exercise, applicationRecords) {
    let writer = new htmlWriter();
    addHtmlCharacterAnnex_MainBody(writer, exercise, applicationRecords);
    return writer.toString();
  }

  /**
   * Add the main body content of the Character Issues report
   *
   * @param {htmlWriter} writer
   * @param {*} exercise
   * @param {*} applicationRecords
   */
  function addHtmlCharacterAnnex_MainBody(writer, exercise, applicationRecords) {
    let candidateCount = 0;
    const statusItems = Object.values(APPLICATION.CHARACTER_ISSUE_STATUS).map(status => {
      const item = { status };
      switch (status) {
      case APPLICATION.CHARACTER_ISSUE_STATUS.PROCEED:
        item.background = 'green';
        break;
      case APPLICATION.CHARACTER_ISSUE_STATUS.REJECT:
      case APPLICATION.CHARACTER_ISSUE_STATUS.REJECT_NON_DECLARATION:
        item.background = 'red';
        break;
      case APPLICATION.CHARACTER_ISSUE_STATUS.DISCUSS:
        item.background = '#FFBF00';
        break;
      default:
        item.background = 'none';
      }
      return item;
    });

    const lastIndex = statusItems.length - 1;
    statusItems.forEach((statusItem, index) => {
      writer.addRaw(`
        <table style="font-size: 0.75rem;">
          <tbody>
      `);
      const { status, background } = statusItem;
      let ars = applicationRecords.filter(ar => ar.issues && ar.issues.characterIssuesStatus === status);
      if (ars.length === 0) return;

      writer.addRaw(`<tr><td colspan="3" style="text-align:center; background-color:${background}; padding:5px"><b>${lookup(status)}</b></td></tr>`);

      Object.values(APPLICATION.CHARACTER_ISSUE_OFFENCE_CATEGORY).forEach(offenceCategory => {
        const filteredApplications = ars.filter(ar => ar.issues && ar.issues.characterIssuesOffenceCategory === offenceCategory);
        if (filteredApplications.length === 0) return;

        writer.addRaw(`<tr><td colspan="3" style="text-align:center; background-color:deepskyblue; padding:5px"><b>${lookup(offenceCategory)}</b></td></tr>`);

        filteredApplications.sort((a, b) => {
          // sort by last name
          const aName = getFormattedName(a.candidate.fullName);
          const bName = getFormattedName(b.candidate.fullName);
          if (aName < bName) return -1;
          if (aName > bName) return 1;
          return 0;
        }).forEach((ar, i) => {
          candidateCount++;
          if (i > 0) {
            writer.addRaw('<tr><td colspan="3" style="background-color:#ddd; padding:0">&nbsp</td></tr>');
          }

          const formattedName = getFormattedName(ar.candidate.fullName);
          const characterIssuesStatusReason = ar.issues && ar.issues.characterIssuesStatusReason ? ar.issues.characterIssuesStatusReason : '';
          const guidanceReference = ar.issues && Array.isArray(ar.issues.characterIssuesGuidanceReferences)
            ? ar.issues.characterIssuesGuidanceReferences.map(item => lookup(item)).join('<br>')
            : '';
          let declaration = '';

          ar.issues.characterIssues.forEach(issue => {
            declaration += `<p><b>${issue.summary}</b></p>`;
            if (Array.isArray(issue.events)) {
              issue.events.forEach((event, i) => {
                let result = [];
                if (event.category) {
                  result.push(`<u>${event.category}</u>`);
                }
                if (event.date) {
                  const prettyDate = getDate(event.date).toJSON().slice(0, 10).split('-').reverse().join('/'); // dd/mm/yyyy
                  result.push(prettyDate);
                }
                if (event.title) {
                  result.push(event.title);
                }
                if (issue.summary === 'Professional Conduct') {
                  if (event.investigations !== null && event.investigations !== undefined) {
                    result.push(`Investigation ongoing: ${helpers.toYesNo(event.investigations)}`);
                  }
                  if (event.investigations === true && event.investigationConclusionDate) {
                    const prettyDate = getDate(event.investigationConclusionDate).toJSON().slice(0, 10).split('-').reverse().join('/'); // dd/mm/yyyy
                    result.push(`Investigation conclusion date: ${prettyDate}`);
                  }
                }
                if (event.details) {
                  result.push(event.details);
                }

                if (result.length) {
                  declaration += `<p>${result.join('<br>')}</p>`;
                }
              });
            }
          });

          writer.addRaw(`
            <tr><td rowspan="4" width="50"><b>${candidateCount}.</b></td><td width="175"><b>Name</b></td><td>${formattedName}</td></tr>
            <tr><td><b>Declaration</b></td><td>${declaration}</td></tr>
            <tr><td><b>Guidance reference</b></td><td>${guidanceReference}</td></tr>
            <tr><td><b>Reason for ${lookup(status)} recommendation</b></td><td>${characterIssuesStatusReason}</td></tr>
          `);
        });
      });

      writer.addRaw(`
          </tbody>
        </table>
      `);

      if (index < lastIndex) {
        writer.addPageBreak();
      }

    });
  }

  /**
   * @param  {string} fullName (e.g. "first name, last name")
   * @return {string} formatted name (e.g. "last name, first name")
   */
  function getFormattedName(fullName) {
    const names = splitFullName(fullName);
    const firstName = names[0] || '';
    const lastName = names[1] || '';
    const result = [];
    if (lastName) result.push(lastName);
    if (firstName) result.push(firstName);
    return result.join(', ');
  }
};
