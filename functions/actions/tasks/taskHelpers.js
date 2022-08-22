
const createTimeline = require('@jac-uk/helpers/Timeline/createTimeline');
const { convertToDate, getEarliestDate, getLatestDate } = require('../../shared/helpers');

module.exports = (config) => {
  const exerciseTimeline = require('../../shared/exerciseTimeline.TMP')(config);
  const TASK_TYPE = config.TASK_TYPE;
  return {
    scoreSheet,
    taskStartDate,
    taskEndDate,
    getTimelineDate,
    getTimelineTasks,
    createMarkingScheme,
    taskNextStatus,
    taskApplicationsEntryStatus,
  };

  function taskNextStatus(taskType, currentStatus) {
    let availableStatuses = [];
    let nextStatus = '';
    switch (taskType) {
      case config.TASK_TYPE.CRITICAL_ANALYSIS:
      case config.TASK_TYPE.SITUATIONAL_JUDGEMENT:
        availableStatuses = [
          config.TASK_STATUS.TEST_INITIALISED,
          config.TASK_STATUS.TEST_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SCENARIO:
        availableStatuses = [
          config.TASK_STATUS.TEST_INITIALISED,
          config.TASK_STATUS.TEST_ACTIVATED,
          config.TASK_STATUS.PANELS_INITIALISED,
          config.TASK_STATUS.PANELS_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.TELEPHONE_ASSESSMENT:
      case config.TASK_TYPE.ELIGIBILITY_SCC:
      case config.TASK_TYPE.CHARACTER_AND_SELECTION_SCC:
        availableStatuses = [
          config.TASK_STATUS.DATA_INITIALISED,
          config.TASK_STATUS.DATA_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SIFT:
      case config.TASK_TYPE.SELECTION:
        availableStatuses = [
          config.TASK_STATUS.PANELS_INITIALISED,
          config.TASK_STATUS.PANELS_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SHORTLISTING_OUTCOME:
      case config.TASK_TYPE.SELECTION_OUTCOME:
        availableStatuses = [
          config.TASK_STATUS.CHECKS_INITIALISED,
          config.TASK_STATUS.CHECKS_ACTIVATED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
    }
    if (!availableStatuses.length) return nextStatus;
    if (!currentStatus) return availableStatuses[0];
    const currentIndex = availableStatuses.indexOf(currentStatus);
    if (currentIndex >= 0) {
      if (currentIndex + 1 < availableStatuses.length) {
        nextStatus = availableStatuses[currentIndex + 1];
      } else {
        nextStatus = availableStatuses[currentIndex];
      }
    }
    return nextStatus;
  }

  function scoreSheet({ type, exercise }) {
    let scoreSheet = {};
    switch (type) {
      case config.TASK_TYPE.SIFT:
        scoreSheet[type] = exercise.capabilities.reduce((acc, curr) => (acc[curr] = '', acc), {});
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

  function getExerciseCapabilities(exercise) {  // returns display order
    if (!exercise) return [];
    return config.CAPABILITIES.filter(cap => exercise.capabilities.indexOf(cap) >= 0);
  }

  function getExerciseSelectionCategories(exercise) {  // returns display order
    if (!exercise) return [];
    return config.SELECTION_CATEGORIES.filter(cap => exercise.selectionCategories.indexOf(cap) >= 0);
  }

  function createMarkingScheme(exercise, taskType) {
    const markingScheme = [];
    switch (taskType) {
    case config.TASK_TYPE.SIFT:
      markingScheme.push(createMarkingSchemeGroup(taskType, getExerciseCapabilities(exercise)));
      break;
    case config.TASK_TYPE.SELECTION:
      getExerciseSelectionCategories(exercise).forEach(cat => {
        markingScheme.push(createMarkingSchemeGroup(cat, getExerciseCapabilities(exercise)));
      });
      break;
    }
    return markingScheme;
  }

  function createMarkingSchemeGroup(ref, childRefs) {
    return {
      ref: ref,
      type: 'group',
      children: childRefs.map(childRef => {
        const item = {
          ref: childRef,
          type: 'grade',
        };
        if (childRef === 'OVERALL') item.excludeFromScore = true;
        return item;
      }),
    };
  }

  function getTimelineTasks(exercise, taskType) {
    const timeline = createTimeline(exerciseTimeline(exercise));
    const timelineTasks = timeline.filter(item => item.taskType && (!taskType || item.taskType === taskType));
    return timelineTasks;
  }

  function getTaskTypes(exercise, stage) {
    let taskTypes = getTimelineTasks(exercise).map(item => item.taskType).filter((value, index, thisArray) => thisArray.indexOf(value) === index);
    if (stage) {
      taskTypes = taskTypes.filter(taskType => STAGE_TASKS[stage].indexOf(taskType) >= 0);
    }
    const indexCA = taskTypes.indexOf(TASK_TYPE.CRITICAL_ANALYSIS);
    const indexSJ = taskTypes.indexOf(TASK_TYPE.SITUATIONAL_JUDGEMENT);
    if (indexCA >= 0 && indexSJ >= 0) {
      const indexQT = Math.max(indexCA, indexSJ);
      taskTypes.splice(indexQT + 1, 0, TASK_TYPE.QUALIFYING_TEST);
    }
    return taskTypes;
  }

  function previousTaskType(exercise, type) {
    let prevTaskType = '';
    if (!exercise) return prevTaskType;
    const taskTypes = getTaskTypes(exercise);
    const currentIndex = taskTypes.indexOf(type);
    if (currentIndex > 0) {
      if ([config.TASK_TYPE.CRITICAL_ANALYSIS, config.TASK_TYPE.SITUATIONAL_JUDGEMENT, config.TASK_TYPE.QUALIFYING_TEST].indexOf(type) >= 0) {
        for (let i = currentIndex; i >= 0; --i) {
          if ([config.TASK_TYPE.CRITICAL_ANALYSIS, config.TASK_TYPE.SITUATIONAL_JUDGEMENT, config.TASK_TYPE.QUALIFYING_TEST].indexOf(taskTypes[i]) < 0) {
            prevTaskType = taskTypes[i];
            break;
          }
        }
      } else {
        prevTaskType = taskTypes[currentIndex - 1];
      }
    }
    return prevTaskType;
  }

  function taskApplicationsEntryStatus(exercise, type) {
    let status = '';
    if (!exercise) return status;
    const prevTaskType = previousTaskType(exercise, type);
    if (prevTaskType) {
      status = `${prevTaskType}Passed`;
    }
    return status;
  }

};
