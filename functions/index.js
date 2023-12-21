
// Scheduled
exports.backupFirestore = require('./scheduledFunctions/backupFirestore');
exports.backupAuthentication = require('./scheduledFunctions/backupAuthentication');
exports.processNotifications = require('./scheduledFunctions/processNotifications');
exports.scheduleScanAllFiles = require('./scheduledFunctions/scheduleScanAllFiles');

// Background
exports.onDelete = require('./backgroundFunctions/onDelete');
exports.onExerciseCreate = require('./backgroundFunctions/onExerciseCreate');
exports.onExerciseUpdate = require('./backgroundFunctions/onExerciseUpdate');
exports.onApplicationCreate = require('./backgroundFunctions/onApplicationCreate');
exports.onApplicationUpdate = require('./backgroundFunctions/onApplicationUpdate');
exports.onAssessmentUpdate = require('./backgroundFunctions/onAssessmentUpdate');
exports.onApplicationRecordUpdate = require('./backgroundFunctions/onApplicationRecordUpdate');
exports.onPanelUpdate = require('./backgroundFunctions/onPanelUpdate');
exports.onDocumentUploaded = require('./backgroundFunctions/onDocumentUploaded');
exports.onCandidatePersonalDetailsCreate = require('./backgroundFunctions/onCandidatePersonalDetailsCreate');
exports.onCandidatePersonalDetailsUpdate = require('./backgroundFunctions/onCandidatePersonalDetailsUpdate');
exports.onMessageCreate = require('./backgroundFunctions/onMessageCreate');
exports.onUserUpdate = require('./backgroundFunctions/onUserCreate');
exports.onUserUpdate = require('./backgroundFunctions/onUserUpdate');
exports.onUserDelete = require('./backgroundFunctions/onUserDelete');
exports.onRoleUpdate = require('./backgroundFunctions/onRoleUpdate');
exports.onCandidateFormResponseUpdate = require('./backgroundFunctions/onCandidateFormResponseUpdate');
exports.onSettingsUpdate = require('./backgroundFunctions/onSettingsUpdate');

// Callable
exports.getApplicationData = require('./callableFunctions/getApplicationData');
exports.generateDiversityReport = require('./callableFunctions/generateDiversityReport');
exports.generateDiversityData = require('./callableFunctions/generateDiversityData');
exports.generateOutreachReport = require('./callableFunctions/generateOutreachReport');
exports.flagApplicationIssuesForExercise = require('./callableFunctions/flagApplicationIssuesForExercise');
exports.initialiseAssessments = require('./callableFunctions/initialiseAssessments');
exports.cancelAssessments = require('./callableFunctions/cancelAssessments');
exports.resetAssessments = require('./callableFunctions/resetAssessments');
exports.testAssessmentNotification = require('./callableFunctions/testAssessmentNotification');
exports.sendAssessmentRequests = require('./callableFunctions/sendAssessmentRequests');
exports.sendAssessmentReminders = require('./callableFunctions/sendAssessmentReminders');
exports.generateSignInWithEmailLink = require('./callableFunctions/generateSignInWithEmailLink');
exports.initialiseApplicationRecords = require('./callableFunctions/initialiseApplicationRecords');
exports.sendApplicationReminders = require('./callableFunctions/sendApplicationReminders');
exports.sendCharacterCheckRequests = require('./callableFunctions/sendCharacterCheckRequests');
exports.sendCandidateFormNotifications = require('./callableFunctions/sendCandidateFormNotifications');
exports.enableCharacterChecks = require('./callableFunctions/enableCharacterChecks');
exports.initialiseMissingApplicationRecords = require('./callableFunctions/initialiseMissingApplicationRecords');
exports.exportExerciseData = require('./callableFunctions/exportExerciseData');
exports.targetedOutreachReport = require('./callableFunctions/targetedOutreachReport');
exports.transferHandoverData = require('./callableFunctions/transferHandoverData');
exports.exportApplicationContactsData = require('./callableFunctions/exportApplicationContactsData');
exports.exportApplicationEligibilityIssues = require('./callableFunctions/exportApplicationEligibilityIssues');
exports.generateHandoverReport = require('./callableFunctions/generateHandoverReport');
exports.generateReasonableAdjustmentsReport = require('./callableFunctions/generateReasonableAdjustmentsReport');
exports.generateAgencyReport = require('./callableFunctions/generateAgencyReport');
exports.generateStatutoryConsultationReport = require('./callableFunctions/generateStatutoryConsultationReport');
exports.logEvent = require('./callableFunctions/logEvent');
exports.scanFile = require('./callableFunctions/scanFile');
exports.scanAllFiles = require('./callableFunctions/scanAllFiles');
exports.exportApplicationCharacterIssues = require('./callableFunctions/exportApplicationCharacterIssues');
exports.getUserEmailByID = require('./callableFunctions/getUserEmailByID');
exports.getUserByEmail = require('./callableFunctions/getUserByEmail');
exports.updateEmailAddress = require('./callableFunctions/updateEmailAddress');
exports.ensureEmailVerified = require('./callableFunctions/ensureEmailVerified');
exports.adminGetUsers = require('./callableFunctions/adminGetUsers');
exports.adminGetUserRoles = require('./callableFunctions/adminGetUserRoles');
exports.adminDisableUser = require('./callableFunctions/adminDisableUser');
exports.adminCreateUserRole = require('./callableFunctions/adminCreateUserRole');
exports.adminUpdateUserRole = require('./callableFunctions/adminUpdateUserRole');
exports.adminSetUserRole = require('./callableFunctions/adminSetUserRole');
exports.adminSetDefaultRole = require('./callableFunctions/adminSetDefaultRole');
exports.adminDisableNewUser = require('./callableFunctions/adminDisableNewUser');
exports.adminSyncUserRolePermissions = require('./callableFunctions/adminSyncUserRolePermissions');
exports.createUser = require('./callableFunctions/createUser');
exports.deleteUsers = require('./callableFunctions/deleteUsers');
exports.customReport = require('./callableFunctions/customReport');
exports.refreshApplicationCounts = require('./callableFunctions/refreshApplicationCounts');
exports.createTestApplications = require('./callableFunctions/createTestApplications');
exports.deleteApplications = require('./callableFunctions/deleteApplications');
exports.createTestUsers = require('./callableFunctions/createTestUsers');
exports.deleteTestUsers = require('./callableFunctions/deleteTestUsers');
exports.createTask = require('./callableFunctions/tasks/createTask');
exports.updateTask = require('./callableFunctions/tasks/updateTask');
exports.verifyRecaptcha = require('./callableFunctions/verifyRecaptcha');
exports.processNotificationsNow = require('./callableFunctions/processNotifications');
exports.checkEnabledUserByEmail = require('./callableFunctions/checkEnabledUserByEmail');
exports.extractDocumentContent = require('./callableFunctions/extractDocumentContent');
exports.updateUserCustomClaims = require('./callableFunctions/updateUserCustomClaims');
exports.createZenhubIssue = require('./callableFunctions/createZenhubIssue');
exports.exportApplicationCommissionerConflicts = require('./callableFunctions/exportApplicationCommissionerConflicts');

// Callable - QTs v2
exports.listQualifyingTests = require('./callableFunctions/qualifyingTests/v2/listQualifyingTests');
exports.updateQualifyingTestParticipants = require('./callableFunctions/qualifyingTests/v2/updateQualifyingTestParticipants');
exports.updateQualifyingTestScores = require('./callableFunctions/qualifyingTests/v2/updateQualifyingTestScores');

