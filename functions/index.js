// Scheduled
import backupFirestore from './scheduledFunctions/backupFirestore.js';
import backupAuthentication from './scheduledFunctions/backupAuthentication.js';
import processNotifications from './scheduledFunctions/processNotifications.js';
import scheduleScanAllFiles from './scheduledFunctions/scheduleScanAllFiles.js';
import runScannerTest from './scheduledFunctions/runScannerTest.js';
import retrySlackMessageOnCreateIssue from './scheduledFunctions/retrySlackMsgOnCreateIssue.js';

// Background
import onDelete from './backgroundFunctions/onDelete.js';
import onExerciseCreate from './backgroundFunctions/onExerciseCreate.js';
import onExerciseUpdate from './backgroundFunctions/onExerciseUpdate.js';
import onApplicationCreate from './backgroundFunctions/onApplicationCreate.js';
import onApplicationUpdate from './backgroundFunctions/onApplicationUpdate.js';
import onAssessmentUpdate from './backgroundFunctions/onAssessmentUpdate.js';
import onApplicationRecordUpdate from './backgroundFunctions/onApplicationRecordUpdate.js';
import onPanelUpdate from './backgroundFunctions/onPanelUpdate.js';
import onDocumentUploaded from './backgroundFunctions/onDocumentUploaded.js';
import onCandidatePersonalDetailsCreate from './backgroundFunctions/onCandidatePersonalDetailsCreate.js';
import onCandidatePersonalDetailsUpdate from './backgroundFunctions/onCandidatePersonalDetailsUpdate.js';
import onMessageCreate from './backgroundFunctions/onMessageCreate.js';
import onUserCreate from './backgroundFunctions/onUserCreate.js';
import onUserUpdate from './backgroundFunctions/onUserUpdate.js';
import onUserDelete from './backgroundFunctions/onUserDelete.js';
import onUserInvitationCreate from './backgroundFunctions/onUserInvitationCreate.js';
import onRoleUpdate from './backgroundFunctions/onRoleUpdate.js';
import onCandidateFormResponseUpdate from './backgroundFunctions/onCandidateFormResponseUpdate.js';
import onSettingsUpdate from './backgroundFunctions/onSettingsUpdate.js';

// Callable
import * as callableFunctions from './callableFunctions/index.js';
import getApplicationData from './callableFunctions/getApplicationData.js';
import flagApplicationIssuesForExercise from './callableFunctions/flagApplicationIssuesForExercise.js';
import initialiseApplicationRecords from './callableFunctions/initialiseApplicationRecords.js';
import enableCharacterChecks from './callableFunctions/enableCharacterChecks.js';
import initialiseMissingApplicationRecords from './callableFunctions/initialiseMissingApplicationRecords.js';
//import transferHandoverData from './callableFunctions/transferHandoverData.js';
import exportApplicationContactsData from './callableFunctions/exportApplicationContactsData.js';
import exportApplicationEligibilityIssues from './callableFunctions/exportApplicationEligibilityIssues.js';
import logEvent from './callableFunctions/logEvent.js';
import exportApplicationCharacterIssues from './callableFunctions/exportApplicationCharacterIssues.js';
import refreshApplicationCounts from './callableFunctions/refreshApplicationCounts.js';
import createTestApplications from './callableFunctions/createTestApplications.js';
import deleteApplications from './callableFunctions/deleteApplications.js';
//import createTestUsers from './callableFunctions/createTestUsers.js';
//import deleteTestUsers from './callableFunctions/deleteTestUsers.js';
import verifyRecaptcha from './callableFunctions/verifyRecaptcha.js';
import verifySmsVerificationCode from './callableFunctions/verifySmsVerificationCode.js';
import verifySlackUser from './callableFunctions/verifySlackUser.js';
import extractDocumentContent from './callableFunctions/extractDocumentContent.js';
import updateUserCustomClaims from './callableFunctions/updateUserCustomClaims.js';
import createZenhubIssue from './callableFunctions/createZenhubIssue.js';
import exportApplicationCommissionerConflicts from './callableFunctions/exportApplicationCommissionerConflicts.js';
import updateApplicationRecordStageStatus from './callableFunctions/updateApplicationRecordStageStatus.js';
import getLatestReleases from './callableFunctions/getLatestReleases.js';
import getMultipleApplicationData from './callableFunctions/getMultipleApplicationData.js';
import exportExerciseData from './callableFunctions/exportExerciseData.js';

// Callable - QTs v2
//import listQualifyingTests from './callableFunctions/qualifyingTests/v2/listQualifyingTests.js';
//import updateQualifyingTestParticipants from './callableFunctions/qualifyingTests/v2/updateQualifyingTestParticipants.js';
//import updateQualifyingTestScores from './callableFunctions/qualifyingTests/v2/updateQualifyingTestScores.js';

// HTTP
import ticketingGithubWebhook from './httpFunctions/ticketingGithubWebhook.js';

export {
  // Scheduled
  backupFirestore,
  backupAuthentication,
  processNotifications,
  scheduleScanAllFiles,
  runScannerTest,
  retrySlackMessageOnCreateIssue,

  // Background
  onDelete,
  onExerciseCreate,
  onExerciseUpdate,
  onApplicationCreate,
  onApplicationUpdate,
  onAssessmentUpdate,
  onApplicationRecordUpdate,
  onPanelUpdate,
  onDocumentUploaded,
  onCandidatePersonalDetailsCreate,
  onCandidatePersonalDetailsUpdate,
  onMessageCreate,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
  onUserInvitationCreate,
  onRoleUpdate,
  onCandidateFormResponseUpdate,
  onSettingsUpdate,

  // Callable


  callableFunctions,

  
  getApplicationData,
  flagApplicationIssuesForExercise,
  initialiseApplicationRecords,
  enableCharacterChecks,
  initialiseMissingApplicationRecords,
  exportExerciseData,
  exportApplicationContactsData,
  exportApplicationEligibilityIssues,
  logEvent,
  exportApplicationCharacterIssues,
  refreshApplicationCounts,
  createTestApplications,
  deleteApplications,
  verifyRecaptcha,
  extractDocumentContent,
  updateUserCustomClaims,
  createZenhubIssue,
  exportApplicationCommissionerConflicts,
  verifySlackUser,
  updateApplicationRecordStageStatus,
  getLatestReleases,
  verifySmsVerificationCode,
  getMultipleApplicationData,

  // Callable - QTs v2
  //listQualifyingTests,
  //updateQualifyingTestParticipants,
  //updateQualifyingTestScores,

  // HTTP
  ticketingGithubWebhook
};
