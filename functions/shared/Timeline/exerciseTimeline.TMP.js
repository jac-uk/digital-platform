
// TODO: THIS IS COPIED FROM ADMIN `helpersTMP` folder. It should be moved to JAC Kit, plus streamlined

const { isDate, formatDate } = require('../helpers');

module.exports = (config) => {
  const TASK_TYPE = config.TASK_TYPE;
  return exerciseTimeline;

  function getDateString(date, format) {
    return isDate(date) ? formatDate(date, format) : null;
  }

  function getDateAndTime(date, startTime) {
    if (!isDate(date) && !isDate(startTime)) {
      return null;
    }
    const result = new Date(date);
    result.setHours(startTime.getHours(), startTime.getMinutes());
    return result;
  }

  function getDateAndTimeString(date, startTime, endTime) {
    const dateString = getDateString(date);
    const startTimeString = getDateString(startTime, 'time');
    const endTimeString = getDateString(endTime, 'time');
    if (!dateString && !startTimeString && !endTimeString) {
      return null;
    }
    return `${dateString} - ${startTimeString} to ${endTimeString}`;
  }

  function createSelectionDay(selectionDay) {
    const selectionDayEntry = {
      entry: `Selection Day - ${selectionDay.selectionDayLocation}`,
      date: selectionDay.selectionDayStart,
      endDate: selectionDay.selectionDayEnd,
      dateString: null,
      taskType: TASK_TYPE.SELECTION,
    };

    const selectionDayStart = getDateString(selectionDay.selectionDayStart);
    const selectionDayEnd = getDateString(selectionDay.selectionDayEnd);

    if (!selectionDayStart || !selectionDayEnd) {
      selectionDayEntry.dateString = '';
    } else if (selectionDayStart !== selectionDayEnd) {
      selectionDayEntry.dateString = `${selectionDayStart} to ${selectionDayEnd}`;
    } else {
      selectionDayEntry.dateString = `${selectionDayStart}`;
    }
    return selectionDayEntry;
  }

  function createShortlistingMethod(method, startDate, endDate, taskType) {
    const shortlistingMethodEntry = {
      entry: `${method}`,
      date: startDate,
      endDate: endDate,
      dateString: null,
      taskType: taskType,
    };

    const formattedStartDate = getDateString(startDate);
    const formattedEndDate = getDateString(endDate);

    if (!formattedStartDate || !formattedEndDate) {
      shortlistingMethodEntry.dateString = '';
    } else if (formattedStartDate !== formattedEndDate) {
      shortlistingMethodEntry.dateString = `${formattedStartDate} to ${formattedEndDate}`;
    } else {
      shortlistingMethodEntry.dateString = `${formattedStartDate}`;
    }
    return shortlistingMethodEntry;
  }

  function exerciseTimeline(data) {
    const timeline = [];

    if (data.applicationOpenDate) {
      timeline.push(
        {
          entry: 'Open for applications',
          date: data.applicationOpenDate,
          dateString: getDateString(data.applicationOpenDate),
        }
      );
    }

    if (data.applicationCloseDate) {
      timeline.push(
        {
          entry: 'Closed for applications',
          date: data.applicationCloseDate,
          dateString: getDateString(data.applicationCloseDate),
        }
      );
    }

    if (data.shortlistingMethods && data.shortlistingMethods.length > 0) {
      if (data.shortlistingOutcomeDate) {
        timeline.push(
          {
            entry: 'Shortlisting outcome',
            date: data.shortlistingOutcomeDate,
            dateString: getDateString(data.shortlistingOutcomeDate, 'month'),
            // taskType: TASK_TYPE.SHORTLISTING_OUTCOME,
          }
        );
      }

      if (data.shortlistingMethods.includes('paper-sift')) {
        timeline.push(
          createShortlistingMethod('Sift', data.siftStartDate, data.siftEndDate, TASK_TYPE.SIFT)
        );
      }

      if (data.shortlistingMethods.includes('name-blind-paper-sift')) {
        timeline.push(
          createShortlistingMethod('Name-blind sift', data.nameBlindSiftStartDate, data.nameBlindSiftEndDate, TASK_TYPE.SIFT)
        );
      }

      if (data.shortlistingMethods.includes('telephone-assessment')) {
        timeline.push(createShortlistingMethod('Telephone assessment', data.telephoneAssessmentStartDate, data.telephoneAssessmentEndDate, TASK_TYPE.TELEPHONE_ASSESSMENT));
      }

      if (data.shortlistingMethods.includes('situational-judgement-qualifying-test')) {
        if (data.situationalJudgementTestDate) {
          timeline.push(
            {
              entry: 'Situational judgement qualifying test (QT)',
              date: getDateAndTime(data.situationalJudgementTestDate, data.situationalJudgementTestStartTime),
              endDate: getDateAndTime(data.situationalJudgementTestDate, data.situationalJudgementTestEndTime),
              dateString: getDateAndTimeString(data.situationalJudgementTestDate, data.situationalJudgementTestStartTime, data.situationalJudgementTestEndTime),
              taskType: TASK_TYPE.SITUATIONAL_JUDGEMENT,
            }
          );
        }
        if (data.situationalJudgementTestOutcome) {
          timeline.push(
            {
              entry: 'Situational judgement QT outcome to candidates',
              date: data.situationalJudgementTestOutcome,
              dateString: getDateString(data.situationalJudgementTestOutcome),
            }
          );
        }
      }

      if (data.shortlistingMethods.includes('critical-analysis-qualifying-test')) {
        if (data.criticalAnalysisTestDate) {
          timeline.push(
            {
              entry: 'Critical analysis qualifying test (QT)',
              date: getDateAndTime(data.criticalAnalysisTestDate, data.criticalAnalysisTestStartTime),
              endDate: getDateAndTime(data.criticalAnalysisTestDate, data.criticalAnalysisTestEndTime),
              dateString: getDateAndTimeString(data.criticalAnalysisTestDate, data.criticalAnalysisTestStartTime, data.criticalAnalysisTestEndTime),
              taskType: TASK_TYPE.CRITICAL_ANALYSIS,
            }
          );
        }
        if (data.criticalAnalysisTestOutcome) {
          timeline.push(
            {
              entry: 'Critical analysis QT outcome to candidates',
              date: data.criticalAnalysisTestOutcome,
              dateString: getDateString(data.criticalAnalysisTestOutcome),
            }
          );
        }
      }

      if (data.shortlistingMethods.includes('scenario-test-qualifying-test')) {
        if (data.scenarioTestDate) {
          timeline.push(
            {
              entry: 'Scenario test',
              date: getDateAndTime(data.scenarioTestDate, data.scenarioTestStartTime),
              endDate: getDateAndTime(data.scenarioTestDate, data.scenarioTestEndTime),
              dateString: getDateAndTimeString(data.scenarioTestDate, data.scenarioTestStartTime, data.scenarioTestEndTime),
              taskType: TASK_TYPE.SCENARIO,
            }
          );
        }
        if (data.scenarioTestOutcome) {
          timeline.push(
            {
              entry: 'Scenario test outcome to candidates',
              date: data.scenarioTestOutcome,
              dateString: getDateString(data.scenarioTestOutcome),
            }
          );
        }
      }
    }

    if (!(data.assessmentMethods && data.assessmentMethods.independentAssessments === false)) {
      if (data.contactIndependentAssessors) {
        timeline.push(
          {
            entry: 'JAC Contacts Independent Assessors',
            date: data.contactIndependentAssessors,
            dateString: getDateString(data.contactIndependentAssessors),
            // TODO make this a task
          }
        );
      }

      if (data.independentAssessmentsReturnDate) {
        timeline.push(
          {
            entry: 'Return date for independent assessments',
            date: data.independentAssessmentsReturnDate,
            dateString: getDateString(data.independentAssessmentsReturnDate),
          }
        );
      }
    }

    if (data.eligibilitySCCDate) {
      timeline.push(
        {
          entry: 'Eligibility SCC',
          date: data.eligibilitySCCDate,
          dateString: getDateString(data.eligibilitySCCDate),
          taskType: TASK_TYPE.ELIGIBILITY_SCC,
        }
      );
    }

    if (data.selectionDays && data.selectionDays.length > 0) {
      for (let i = 0; i < data.selectionDays.length; i++) {
        if (data.selectionDays[i].selectionDayStart) {
          timeline.push(createSelectionDay(data.selectionDays[i]));
        }
      }
    }

    if (data.characterChecksDate) {
      timeline.push(
        {
          entry: 'Character Checks',
          date: data.characterChecksDate,
          dateString: getDateString(data.characterChecksDate),
          // TODO make this a task
        }
      );
    }

    if (data.characterChecksReturnDate) {
      timeline.push(
        {
          entry: 'Character Checks return',
          date: data.characterChecksReturnDate,
          dateString: getDateString(data.characterChecksReturnDate),
        }
      );
    }

    if (data.statutoryConsultationDate) {
      timeline.push(
        {
          entry: 'Statutory consultation',
          date: data.statutoryConsultationDate,
          dateString: getDateString(data.statutoryConsultationDate),
          taskType: TASK_TYPE.STATUTORY_CONSULTATION,
        }
      );
    }

    if (data.characterAndSCCDate) {
      timeline.push(
        {
          entry: 'Character and Selection SCC',
          date: data.characterAndSCCDate,
          dateString: getDateString(data.characterAndSCCDate),
          taskType: TASK_TYPE.CHARACTER_AND_SELECTION_SCC,
        }
      );
    }

    if (data.finalOutcome) {
      timeline.push(
        {
          entry: 'Selection process outcome',
          date: data.finalOutcome,
          dateString: getDateString(data.finalOutcome),
          taskType: TASK_TYPE.SELECTION_OUTCOME,
        }
      );
    }

    if (data.equalMeritSecondStageStartDate) {
      timeline.push(
        createShortlistingMethod('Equal merit second stage', data.equalMeritSecondStageStartDate, data.equalMeritSecondStageEndDate)
      );
    }

    if (data.eMPSCCDate) {
      timeline.push(
        {
          entry: 'EMP SCC',
          date: data.eMPSCCDate,
          dateString: getDateString(data.eMPSCCDate),
        }
      );
    }

    if (data.eMPOutcomeDate) {
      timeline.push(
        {
          entry: 'EMP Outcomes',
          date: data.eMPOutcomeDate,
          dateString: getDateString(data.eMPOutcomeDate),
        }
      );
    }

    return timeline;
  }

};