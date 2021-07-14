
// Scheduled
exports.backupFirestore = require('./scheduledFunctions/backupFirestore');
exports.backupAuthentication = require('./scheduledFunctions/backupAuthentication');
exports.processNotifications = require('./scheduledFunctions/processNotifications');

// Background
exports.onDelete = require('./backgroundFunctions/onDelete');
// exports.onExerciseCreate = require('./backgroundFunctions/onExerciseCreate');
exports.onExerciseUpdate = require('./backgroundFunctions/onExerciseUpdate');
exports.onApplicationCreate = require('./backgroundFunctions/onApplicationCreate');
exports.onApplicationUpdate = require('./backgroundFunctions/onApplicationUpdate');
exports.onAssessmentUpdate = require('./backgroundFunctions/onAssessmentUpdate');
exports.onApplicationRecordUpdate = require('./backgroundFunctions/onApplicationRecordUpdate');
exports.onQualifyingTestResponseUpdate = require('./backgroundFunctions/onQualifyingTestResponseUpdate');
exports.onPanelUpdate = require('./backgroundFunctions/onPanelUpdate');
exports.onDocumentUploaded = require('./backgroundFunctions/onDocumentUploaded');
exports.onCandidatePersonalDetailsUpdate = require('./backgroundFunctions/onCandidatePersonalDetailsUpdate');

// Callable
exports.generateDiversityReport = require('./callableFunctions/generateDiversityReport');
exports.generateOutreachReport = require('./callableFunctions/generateOutreachReport');
exports.flagApplicationIssuesForExercise = require('./callableFunctions/flagApplicationIssuesForExercise');
exports.initialiseAssessments = require('./callableFunctions/initialiseAssessments');
exports.cancelAssessments = require('./callableFunctions/cancelAssessments');
exports.testAssessmentNotification = require('./callableFunctions/testAssessmentNotification');
exports.sendAssessmentRequests = require('./callableFunctions/sendAssessmentRequests');
exports.sendAssessmentReminders = require('./callableFunctions/sendAssessmentReminders');
exports.generateSignInWithEmailLink = require('./callableFunctions/generateSignInWithEmailLink');
exports.initialiseApplicationRecords = require('./callableFunctions/initialiseApplicationRecords');
exports.sendCharacterCheckRequests = require('./callableFunctions/sendCharacterCheckRequests');
exports.updateCharacterChecksStatus = require('./callableFunctions/updateCharacterChecksStatus');
exports.initialiseQualifyingTest = require('./callableFunctions/initialiseQualifyingTest');
exports.activateQualifyingTest = require('./callableFunctions/activateQualifyingTest');
exports.initialiseMissingApplicationRecords = require('./callableFunctions/initialiseMissingApplicationRecords');
exports.sendQualifyingTestReminders = require('./callableFunctions/sendQualifyingTestReminders');
exports.scoreQualifyingTest = require('./callableFunctions/scoreQualifyingTest');
exports.cutOffScoreUpdateStatuses = require('./callableFunctions/cutOffScoreUpdateStatuses');
exports.updateStatus = require('./callableFunctions/updateStatus');
exports.generateQualifyingTestReport = require('./callableFunctions/generateQualifyingTestReport');
exports.exportExerciseData = require('./callableFunctions/exportExerciseData');
exports.transferHandoverData = require('./callableFunctions/transferHandoverData');
exports.exportApplicationContactsData = require('./callableFunctions/exportApplicationContactsData');
exports.exportApplicationEligibilityIssues = require('./callableFunctions/exportApplicationEligibilityIssues');
exports.generateHandoverReport = require('./callableFunctions/generateHandoverReport');
exports.generateReasonableAdjustmentsReport = require('./callableFunctions/generateReasonableAdjustmentsReport');
exports.exportQualifyingTestResponses = require('./callableFunctions/exportQualifyingTestResponses');
exports.generateAgencyReport = require('./callableFunctions/generateAgencyReport');
exports.logEvent = require('./callableFunctions/logEvent');
exports.scanFile = require('./callableFunctions/scanFile');
exports.exportApplicationCharacterIssues = require('./callableFunctions/exportApplicationCharacterIssues');
exports.getUserEmailByID = require('./callableFunctions/getUserEmailByID');
exports.updateEmailAddress = require('./callableFunctions/updateEmailAddress');

// exports.onExerciseUpdate_PublishVacancy = require('./exercises/onExerciseUpdate_PublishVacancy');
// exports.onWriteVacancyStats = require('./exercises/onWriteVacancyStats');

// // exports.sendExerciseStartedEmail = require('./exercises/sendExerciseStartedEmail');
// // exports.handleExerciseMailboxChange = require('./exercises/handleExerciseMailboxChange');
// // exports.handleCandidateOnCreate = require('./candidates/handleCandidateOnCreate');
// exports.handleApplicationOnCreate = require('./applications/handleApplicationOnCreate');
// // exports.handleApplicationOnUpdate = require('./applications/handleApplicationOnUpdate');
// // exports.handleExerciseTimelineDates = require('./exercises/handleExerciseTimelineDates');
