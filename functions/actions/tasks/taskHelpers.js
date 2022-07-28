const { convertToDate, getEarliestDate, getLatestDate } = require('../../shared/helpers');

module.exports = (config) => {
  return {
    scoreSheet,
    taskStartDate,
    taskEndDate,
    getTimelineDate,
  };


  function scoreSheet({ type, exercise }) {
    let scoreSheet = {};
    switch (type) {
      case config.TASK_TYPE.SIFT:
        scoreSheet = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        break;
      case config.TASK_TYPE.SELECTION:
        exercise.selectionCategories.forEach(category => {
          scoreSheet[category] = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        });
        break;
      case config.TASK_TYPE.SCENARIO:
        // TODO scenario
        scoreSheet = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
        break;
    }
    return scoreSheet;
  }

  function taskStartDate({ type, exercise }) {
    switch (type) {
      case config.TASK_TYPE.SIFT:
        if (exercise.shortlistingMethods.indexOf('name-blind-paper-sift') >= 0 && exercise.nameBlindSiftStartDate) {
          return exercise.nameBlindSiftStartDate;
        } else {
          return exercise.siftStartDate;
        }
      case config.TASK_TYPE.SELECTION:
        return getEarliestDate(exercise.selectionDays.map(selectionDay => convertToDate(selectionDay.selectionDayStart)));
      case config.TASK_TYPE.CRITICAL_ANALYSIS:
      case config.TASK_TYPE.SITUATIONAL_JUDGEMENT:
      case config.TASK_TYPE.SCENARIO:
        return getTimelineDate(exercise, type, 'Start');
    }
    return null;
  }

  function taskEndDate({ type, exercise }) {
    switch (type) {
      case config.TASK_TYPE.SIFT:
        if (exercise.shortlistingMethods.indexOf('name-blind-paper-sift') >= 0 && exercise.nameBlindSiftEndDate) {
          return exercise.nameBlindSiftEndDate;
        } else {
          return exercise.siftEndDate;
        }
      case config.TASK_TYPE.SELECTION:
        return getLatestDate(exercise.selectionDays.map(selectionDay => convertToDate(selectionDay.selectionDayEnd)));
      case config.TASK_TYPE.CRITICAL_ANALYSIS:
      case config.TASK_TYPE.SITUATIONAL_JUDGEMENT:
      case config.TASK_TYPE.SCENARIO:
        return getTimelineDate(exercise, type, 'End');
     }
    return null;
  }

  function getTimelineDate(exercise, taskType, dateType) {
    let datetime;

    if (!exercise.shortlistingMethods) {
      return datetime;
    }

    let fieldName;
    if (taskType === config.TASK_TYPE.SCENARIO && exercise.shortlistingMethods.includes(config.SHORTLISTING.SCENARIO_TEST_QUALIFYING_TEST)) {
      fieldName = 'scenarioTest';
    }
    if (taskType === config.TASK_TYPE.SITUATIONAL_JUDGEMENT && exercise.shortlistingMethods.includes(config.SHORTLISTING.SITUATIONAL_JUDGEMENT_QUALIFYING_TEST)) {
      fieldName = 'situationalJudgementTest';
    }
    if (taskType === config.TASK_TYPE.CRITICAL_ANALYSIS && exercise.shortlistingMethods.includes(config.SHORTLISTING.CRITICAL_ANALYSIS_QUALIFYING_TEST)) {
      fieldName = 'criticalAnalysisTest';
    }

    const date = convertToDate(exercise[`${fieldName}Date`]);
    const time = convertToDate(exercise[`${fieldName}${dateType}Time`]);

    if (date instanceof Date) {
      datetime = new Date(date.getTime());
    }
    if (time instanceof Date) {
      datetime.setHours(time.getHours());
      datetime.setMinutes(time.getMinutes());
    }

    return datetime;
  }

};
