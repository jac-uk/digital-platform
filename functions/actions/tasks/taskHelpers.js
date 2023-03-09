
const createTimeline = require('../../shared/Timeline/createTimeline');
const { convertToDate } = require('../../shared/helpers');

module.exports = (config) => {
  const exerciseTimeline = require('../../shared/Timeline/exerciseTimeline.TMP')(config);
  const TASK_TYPE = config.TASK_TYPE;
  return {
    scoreSheet,
    getTimelineDate,
    getTimelineTasks,
    createMarkingScheme,
    taskStatuses,
    taskNextStatus,
    taskApplicationsEntryStatus,
    finaliseScoreSheet,
    getScoreSheetTotal,
    getEmptyScoreSheet,
    scoreSheet2MarkingScheme,
    hasQualifyingTest,
    getApplicationPassStatus,
    getApplicationFailStatus,
    getApplicationPassStatuses,
    getApplicationFailStatuses,
  };

  function taskStatuses(taskType) {
    let availableStatuses = [];
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
      case config.TASK_TYPE.QUALIFYING_TEST:
        availableStatuses = [
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SCENARIO:
        availableStatuses = [
          config.TASK_STATUS.TEST_INITIALISED,
          config.TASK_STATUS.TEST_ACTIVATED,
          // config.TASK_STATUS.PANELS_INITIALISED,
          // config.TASK_STATUS.PANELS_ACTIVATED,
          config.TASK_STATUS.DATA_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.TELEPHONE_ASSESSMENT:
      case config.TASK_TYPE.ELIGIBILITY_SCC:
      case config.TASK_TYPE.STATUTORY_CONSULTATION:
      case config.TASK_TYPE.CHARACTER_AND_SELECTION_SCC:
          availableStatuses = [
          config.TASK_STATUS.STATUS_CHANGES,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SIFT:
      case config.TASK_TYPE.SELECTION:
        availableStatuses = [
          config.TASK_STATUS.DATA_INITIALISED,
          config.TASK_STATUS.DATA_ACTIVATED,
          // config.TASK_STATUS.PANELS_INITIALISED,
          // config.TASK_STATUS.PANELS_ACTIVATED,
          config.TASK_STATUS.FINALISED,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
      case config.TASK_TYPE.SHORTLISTING_OUTCOME:
      case config.TASK_TYPE.SELECTION_OUTCOME:
        availableStatuses = [
          config.TASK_STATUS.STAGE_OUTCOME,
          config.TASK_STATUS.COMPLETED,
        ];
        break;
    }
    return availableStatuses;
  }

  function taskNextStatus(taskType, currentStatus) {
    let availableStatuses = taskStatuses(taskType);
    let nextStatus = '';
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

  function getApplicationPassStatus(exercise, task) {
    // TODO the following overrides can be removed when we move to new stages & statuses
    if (
      [
        TASK_TYPE.CRITICAL_ANALYSIS,
        TASK_TYPE.SITUATIONAL_JUDGEMENT,
        TASK_TYPE.QUALIFYING_TEST,
        TASK_TYPE.SCENARIO,
      ].indexOf(task.type) >= 0
    ) {
      if ([TASK_TYPE.CRITICAL_ANALYSIS, TASK_TYPE.SITUATIONAL_JUDGEMENT].indexOf(task.type) >= 0) {
        if (!hasQualifyingTest(exercise, task)) return 'passedFirstTest';
      }
      if (task.type === TASK_TYPE.QUALIFYING_TEST) {
        return 'passedFirstTest';
      }
      if (task.type === TASK_TYPE.SCENARIO) {
        return 'passedScenarioTest';
      }
    }
    // end
    return `${task.type}Passed`;
  }

  function getApplicationFailStatus(exercise, task) {
    // TODO the following overrides can be removed when we move to new stages & statuses
    if (
      [
        TASK_TYPE.CRITICAL_ANALYSIS,
        TASK_TYPE.SITUATIONAL_JUDGEMENT,
        TASK_TYPE.QUALIFYING_TEST,
        TASK_TYPE.SCENARIO,
      ].indexOf(task.type) >= 0
    ) {
      if ([TASK_TYPE.CRITICAL_ANALYSIS, TASK_TYPE.SITUATIONAL_JUDGEMENT].indexOf(task.type) >= 0) {
        if (!hasQualifyingTest(exercise, task)) return 'failedFirstTest';
      }
      if (task.type === TASK_TYPE.QUALIFYING_TEST) {
        return 'failedFirstTest';
      }
      if (task.type === TASK_TYPE.SCENARIO) {
        return 'failedScenarioTest';
      }
    }
    // end
    return `${task.type}Failed`;
  }

  function hasQualifyingTest(exercise) {
    const hasCA = Boolean(exercise.shortlistingMethods.indexOf(config.SHORTLISTING.CRITICAL_ANALYSIS_QUALIFYING_TEST) >= 0 && exercise.criticalAnalysisTestDate);
    const hasSJ = Boolean(exercise.shortlistingMethods.indexOf(config.SHORTLISTING.SITUATIONAL_JUDGEMENT_QUALIFYING_TEST) >= 0 && exercise.situationalJudgementTestDate);
    return hasCA && hasSJ;
  }

  function getApplicationPassStatuses(taskType) {
    const statuses = [];
    switch (taskType) {
    // customise task types here
    default:
      statuses.push(`${taskType}Passed`);
    }
    return statuses;
  }

  function getApplicationFailStatuses(taskType) {
    const statuses = [];
    switch (taskType) {
    // customise task types here
    case config.TASK_TYPE.ELIGIBILITY_SCC:
      statuses.push(config.APPLICATION.STATUS.REJECTED_INELIGIBLE_STATUTORY);
      statuses.push(config.APPLICATION.STATUS.REJECTED_INELIGIBLE_ADDITIONAL);
      break;
    default:
      statuses.push(`${taskType}Failed`);
    }
    return statuses;
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
    console.log('createMarkingScheme', exercise, taskType);
    const markingScheme = [];
    switch (taskType) {
    case config.TASK_TYPE.SIFT:
      console.log('sift', getExerciseCapabilities(exercise));
      markingScheme.push(createMarkingSchemeGroup(taskType, getExerciseCapabilities(exercise)));
      break;
    case config.TASK_TYPE.SELECTION:
      getExerciseSelectionCategories(exercise).forEach(cat => {
        markingScheme.push(createMarkingSchemeGroup(cat, getExerciseCapabilities(exercise)));
      });
      break;
    default:
      markingScheme.push(createMarkingSchemeGroup(taskType, []));
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

  function finaliseScoreSheet(markingScheme, scoreSheet) {
    if (!markingScheme) return scoreSheet;
    if (!scoreSheet) return scoreSheet;
    delete scoreSheet.flagForModeration;  //  removing `flagForModeration` flag in order to reduce object size
    markingScheme.forEach(item => {
      if (item.type === config.MARKING_TYPE.GROUP) {
        scoreSheet[item.ref].score = 0;
        item.children.forEach(child => {
          scoreSheet[item.ref].score += getScoreSheetItemTotal(child, scoreSheet[item.ref]);
        });
      }
    });
    return scoreSheet;
  }

  function getScoreSheetTotal(markingScheme, scoreSheet) {
    let score = 0;
    if (!markingScheme) return score;
    if (!scoreSheet) return score;
    markingScheme.forEach(item => {
      if (item.type === config.MARKING_TYPE.GROUP) {
        item.children.forEach(child => {
          score += getScoreSheetItemTotal(child, scoreSheet[item.ref]);
        });
      } else {
        score += getScoreSheetItemTotal(item, scoreSheet);
      }
    });
    return score;
  }

  function getScoreSheetItemTotal(item, scoreSheet) {
    if (!item.excludeFromScore) {
      switch (item.type) {
      case config.MARKING_TYPE.GRADE:
        if (scoreSheet[item.ref] && config.GRADE_VALUES[scoreSheet[item.ref]]) {
          return config.GRADE_VALUES[scoreSheet[item.ref]];
        }
        break;
      case config.MARKING_TYPE.NUMBER:
        if (scoreSheet[item.ref]) {
          return parseFloat(scoreSheet[item.ref]);
        }
        break;
      }
    }
    return 0;
  }

  function getEmptyScoreSheet(arrData) {
    const returnObject = {};
    arrData.forEach(item => {
      if (item.indexOf('.') >= 0) {
        const parts = item.split('.');
        if (!returnObject[parts[0]]) returnObject[parts[0]] = {};
        returnObject[parts[0]][parts[1]] = '';
      } else {
        returnObject[item] = '';
      }
    });
    return returnObject;
  }

  function scoreSheet2MarkingScheme(scoreSheet) {
    const markingScheme = [];
    Object.keys(scoreSheet).forEach(key => {
      if (typeof scoreSheet[key] === 'object') {
        const children = [];
        Object.keys(scoreSheet[key]).forEach(childKey => {
          children.push({
            ref: childKey,
            type: 'number',
          });
        });
        markingScheme.push({
          ref: key,
          type: 'group',
          children: children,
        });
      } else {
        markingScheme.push({
          ref: key,
          type: 'number',
        });
      }
    });
    return markingScheme;
  }

};
