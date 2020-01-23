/**
 * On exercise update ensure vacancy document is created, updated or deleted
 *  - When an exercise is first marked as published (`published: true`) create a corresponding vacancy document
 *  - Update vacancy document when a draft or ready-for-approval exercise is updated
 *  - When an exercise is first unpublished (`published: false`) delete the corresponding vacancy document
 */

const functions = require('firebase-functions');
const { db, setData } = require('../sharedServices');

exports.onExerciseUpdate_PublishVacancy = functions.region('europe-west2').firestore
.document('exercises/{exerciseId}')
.onUpdate((change, context) => {
  const data = change.after.data();
  const previousData = change.before.data();
  
  if (data.published === true) {
    if (
      previousData.published !== true || (
        previousData.published === true && 
        (previousData.state === 'draft' || previousData.state === 'ready') 
      )
    ) {
      const vacancyModel = {
        aboutTheRole: null,
        applicationCloseDate: null,
        applicationOpenDate: null,
        appliedSchedule: null,
        appointmentType: null,
        aSCApply: null,
        assessmentOptions: null,
        authorisations: null,
        contactIndependentAssessors: null,
        criticalAnalysisTestDate: null,
        criticalAnalysisTestEndTime: null,
        criticalAnalysisTestStartTime: null,
        estimatedLaunchDate: null,
        exerciseMailbox: null,
        exercisePhoneNumber: null,
        feePaidFee: null,
        finalOutcome: null,
        futureStart: null,
        immediateStart: null,
        isCourtOrTribunal: null,
        isSPTWOffered: null,
        jurisdiction: null,
        jurisdictionQuestion: null,
        jurisdictionQuestionAnswers: null,
        jurisdictionQuestionType: null,
        location: null,
        locationQuestion: null,
        locationQuestionAnswers: null,
        locationQuestionType: null,
        memberships: null,
        name: null,
        noSalaryDetails: null,
        otherJurisdiction: null,
        otherLOS: null,
        otherMemberships: null,
        otherQualifications: null,
        otherRetirement: null,
        otherShortlistingMethod: null,
        otherYears: null,
        postQualificationExperience: null,
        previousJudicialExperienceApply: null,
        qualifications: null,
        reasonableLengthService: null,
        referenceNumber: null,
        retirementAge: null,
        roleSummary: null,
        salaryGrouping: null,
        scenarioTestDate: null,
        scenarioTestEndTime: null,
        scenarioTestStartTime: null,
        schedule2Apply: null,
        selectionCriteria: null,
        selectionDays: null,
        shortlistingMethods: null,
        shortlistingOutcomeDate: null,
        situationalJudgementTestDate: null,
        situationalJudgementTestEndTime: null,
        situationalJudgementTestStartTime: null,
        subscriberAlertsUrl: null,
        typeOfExercise: null,
        uploadedCandidateAssessmentFormTemplate: null,
        uploadedIndependentAssessorTemplate: null,
        uploadedJobDescriptionTemplate: null,
        uploadedTermsAndConditionsTemplate: null,
        welshRequirement: null,
        welshRequirementType: null,
        yesSalaryDetails: null,
      };
      const vacancy = { ...vacancyModel };
      for (var key in vacancyModel) {
        if (data[key]) {
          vacancy[key] = data[key];
        }
      }
      setData('vacancies', context.params.exerciseId, vacancy);
    }
  }
  if (data.published === false) {
    if (previousData.published === true) {
      try {
        db.collection('vacancies').doc(context.params.exerciseId).delete();
        console.log('Un-publish exercis;e. Document deleted', { collection: 'vacancies', id: context.params.exerciseId });
      } catch (e) {
        // do nothing
      }
    }
  }

});
