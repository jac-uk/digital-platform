import { applyUpdates, convertToDate, getDocuments, getLatestDate, timeDifference } from '../../shared/helpers.js';

const closeDiffMS = 15768000000; // six months

export default (db) => {
  return {
    closeExercises,
  };

  async function closeExercises() {
    // get published exercises
    const exercises = await getDocuments(db.collection('exercises')
      .where('published', '==', true)
    );
    if (!exercises) return false;

    const commands = [];
    const expiredExercises = exercises.filter(exercise => {
      const dates = getExerciseTimelineDates(exercise);
      const lastestDate = getLatestDate(convertToDate(dates));
      return lastestDate && isExpired(lastestDate);
    });
    expiredExercises.forEach(exercise => {
      commands.push({
        command: 'update',
        ref: db.collection('exercises').doc(exercise.id),
        data: {
          published: false,
          state: 'archived',
        },
      });
    });

    let result = false;
    if (commands.length) {
      result = await applyUpdates(db, commands);
    }

    return result ? expiredExercises.map(exercise => exercise.id) : false;
  }

  function getExerciseTimelineDates(data) {
    const timeline = [];
  
    if (data.applicationOpenDate) {
      timeline.push(data.applicationOpenDate);
    }
  
    if (data.applicationCloseDate) {
      timeline.push(data.applicationCloseDate);
    }
  
    if (data.shortlistingMethods && data.shortlistingMethods.length > 0) {
      if (data.shortlistingOutcomeDate) {
        timeline.push(data.shortlistingOutcomeDate);
      }
  
      if (data.shortlistingMethods.includes('paper-sift')) {
        if (data.siftStartDate) timeline.push(data.siftStartDate);
        if (data.siftEndDate) timeline.push(data.siftEndDate);
      }
  
      if (data.shortlistingMethods.includes('name-blind-paper-sift')) {
        if (data.nameBlindSiftStartDate) timeline.push(data.nameBlindSiftStartDate);
        if (data.nameBlindSiftEndDate) timeline.push(data.nameBlindSiftEndDate);
      }
  
      if (data.shortlistingMethods.includes('telephone-assessment')) {
        if (data.telephoneAssessmentStartDate) timeline.push(data.telephoneAssessmentStartDate);
        if (data.telephoneAssessmentEndDate) timeline.push(data.telephoneAssessmentEndDate);
      }
  
      if (data.shortlistingMethods.includes('situational-judgement-qualifying-test')) {
        if (data.situationalJudgementTestDate) {
          timeline.push(data.situationalJudgementTestDate);
        }
        if (data.situationalJudgementTestStartTime) {
          timeline.push(data.situationalJudgementTestStartTime);
        }
        if (data.situationalJudgementTestOutcome) {
          timeline.push(data.situationalJudgementTestOutcome);
        }
      }
  
      if (data.shortlistingMethods.includes('critical-analysis-qualifying-test')) {
        if (data.criticalAnalysisTestDate) {
          timeline.push(data.criticalAnalysisTestDate);
        }if (data.criticalAnalysisTestStartTime) {
          timeline.push(data.criticalAnalysisTestStartTime);
        }
        if (data.criticalAnalysisTestOutcome) {
          timeline.push(data.criticalAnalysisTestOutcome);
        }
      }
  
      if (data.shortlistingMethods.includes('scenario-test-qualifying-test')) {
        if (data.scenarioTestDate) {
          timeline.push(data.scenarioTestDate);
        }
        if (data.scenarioTestStartTime) {
          timeline.push(data.scenarioTestStartTime);
        }
        if (data.scenarioTestOutcome) {
          timeline.push(data.scenarioTestOutcome);
        }
      }
    }
  
    if (!(data.assessmentMethods && data.assessmentMethods.independentAssessments === false)) {
      if (data.contactIndependentAssessors) {
        timeline.push(data.contactIndependentAssessors);
      }
  
      if (data.independentAssessmentsReturnDate) {
        timeline.push(data.independentAssessmentsReturnDate);
      }
    }
  
    if (data.eligibilitySCCDate) {
      timeline.push(data.eligibilitySCCDate);
    }
  
    if (data.selectionDays && data.selectionDays.length > 0) {
      for (let i = 0; i < data.selectionDays.length; i++) {
        if (data.selectionDays[i].selectionDayStart) {
          timeline.push(data.selectionDays[i].selectionDayStart);
        }
        if (data.selectionDays[i].selectionDayEnd) {
          timeline.push(data.selectionDays[i].selectionDayEnd);
        }
      }
    }
  
    if (data.characterChecksDate) {
      timeline.push(data.characterChecksDate);
    }
  
    if (data.characterChecksReturnDate) {
      timeline.push(data.characterChecksReturnDate);
    }
  
    if (data.statutoryConsultationDate) {
      timeline.push(data.statutoryConsultationDate);
    }
  
    if (data.characterAndSCCDate) {
      timeline.push(data.characterAndSCCDate);
    }
  
    if (data.finalOutcome) {
      timeline.push(data.finalOutcome);
    }
  
    if (data.equalMeritSecondStageStartDate) {
      timeline.push(data.equalMeritSecondStageStartDate);
    }
    if (data.equalMeritSecondStageEndDate) {
      timeline.push(data.equalMeritSecondStageEndDate);
    }
  
    if (data.eMPSCCDate) {
      timeline.push(data.eMPSCCDate);
    }
  
    if (data.eMPOutcomeDate) {
      timeline.push(data.eMPOutcomeDate);
    }
  
    return timeline;
  }

  function isExpired(date) {
    const now = new Date();
    const diff = timeDifference(now, date);
    return diff >= closeDiffMS;
  }
};
