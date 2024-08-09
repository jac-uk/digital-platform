
import createTimeline from '../../shared/Timeline/createTimeline.js';
import { convertToDate, calculateMean, calculateStandardDeviation } from '../../shared/helpers.js';
import initExerciseTimeline from '../../shared/Timeline/exerciseTimeline.TMP.js';

export default (config) => {
  const exerciseTimeline = initExerciseTimeline(config);
  const TASK_TYPE = config.TASK_TYPE;
  const SHORTLISTING_TASK_TYPES = config.SHORTLISTING_TASK_TYPES;
  const TASK_STATUS = config.TASK_STATUS;
  const APPLICATION_STATUS = config.APPLICATION.STATUS;
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
    getApplicationDidNotParticipateStatus,
    getApplicationPassStatuses,
    getApplicationFailStatuses,
    includeZScores,
  };

  function taskStatuses(taskType) {
    let availableStatuses = [];
    switch (taskType) {
      case TASK_TYPE.CRITICAL_ANALYSIS:
      case TASK_TYPE.SITUATIONAL_JUDGEMENT:
        availableStatuses = [
          TASK_STATUS.TEST_INITIALISED,
          TASK_STATUS.TEST_ACTIVATED,
          TASK_STATUS.FINALISED,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.QUALIFYING_TEST:
        availableStatuses = [
          TASK_STATUS.FINALISED,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.SCENARIO:
      case TASK_TYPE.EMP_TIEBREAKER:
        availableStatuses = [
          TASK_STATUS.TEST_INITIALISED,
          TASK_STATUS.TEST_ACTIVATED,
          // TASK_STATUS.PANELS_INITIALISED,
          // TASK_STATUS.PANELS_ACTIVATED,
          TASK_STATUS.DATA_ACTIVATED,
          TASK_STATUS.FINALISED,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.TELEPHONE_ASSESSMENT:
      case TASK_TYPE.ELIGIBILITY_SCC:
      case TASK_TYPE.STATUTORY_CONSULTATION:
      case TASK_TYPE.CHARACTER_AND_SELECTION_SCC:
          availableStatuses = [
          TASK_STATUS.STATUS_CHANGES,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE:
        availableStatuses = [
          TASK_STATUS.CANDIDATE_FORM_CONFIGURE,
          TASK_STATUS.CANDIDATE_FORM_MONITOR,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.SIFT:
      case TASK_TYPE.SELECTION_DAY:
        availableStatuses = [
          TASK_STATUS.DATA_INITIALISED,
          TASK_STATUS.DATA_ACTIVATED,
          // TASK_STATUS.PANELS_INITIALISED,
          // TASK_STATUS.PANELS_ACTIVATED,
          TASK_STATUS.FINALISED,
          TASK_STATUS.COMPLETED,
        ];
        break;
      case TASK_TYPE.SHORTLISTING_OUTCOME:
      case TASK_TYPE.SELECTION_OUTCOME:
        availableStatuses = [
          TASK_STATUS.STAGE_OUTCOME,
          TASK_STATUS.COMPLETED,
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

  function getApplicationDidNotParticipateStatus(exercise, task) {
    switch (task.type) {
    case TASK_TYPE.CRITICAL_ANALYSIS:
    case TASK_TYPE.SITUATIONAL_JUDGEMENT:
    case TASK_TYPE.QUALIFYING_TEST:
      return 'noTestSubmitted';
    case TASK_TYPE.SCENARIO:
      return 'noScenarioTestSubmitted';
    // case TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE:
    //   return 'noSelectionDayQuestionnaireSubmitted';
    default:
      return null;
    }
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
      case config.TASK_TYPE.SELECTION_DAY:
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
    // console.log('createMarkingScheme', exercise, taskType);
    const markingScheme = [];
    switch (taskType) {
    case config.TASK_TYPE.SIFT:
      console.log('sift', getExerciseCapabilities(exercise));
      markingScheme.push(createMarkingSchemeGroup(taskType, getExerciseCapabilities(exercise)));
      break;
    case config.TASK_TYPE.SELECTION_DAY:
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
    let timelineTasks = timeline.filter(item => item.taskType && (!taskType || item.taskType === taskType));
    let supportedTaskTypes = [];
    if (exercise._processingVersion >= 3) {
      supportedTaskTypes = [
        TASK_TYPE.TELEPHONE_ASSESSMENT,
        TASK_TYPE.SIFT,
        TASK_TYPE.CRITICAL_ANALYSIS,
        TASK_TYPE.SITUATIONAL_JUDGEMENT,
        TASK_TYPE.QUALIFYING_TEST,
        TASK_TYPE.SCENARIO,
        // TASK_TYPE.SHORTLISTING_OUTCOME,
        // TASK_TYPE.ELIGIBILITY_SCC,
        // TASK_TYPE.STATUTORY_CONSULTATION,
        // TASK_TYPE.CHARACTER_AND_SELECTION_SCC,
        TASK_TYPE.EMP_TIEBREAKER,
        // TASK_TYPE.PRE_SELECTION_DAY_QUESTIONNAIRE,
        TASK_TYPE.SELECTION_DAY,
      ];
    } else {
      supportedTaskTypes = [
        TASK_TYPE.CRITICAL_ANALYSIS,
        TASK_TYPE.SITUATIONAL_JUDGEMENT,
        TASK_TYPE.QUALIFYING_TEST,
        TASK_TYPE.SCENARIO,
        TASK_TYPE.EMP_TIEBREAKER,
      ];
    }
    timelineTasks = timelineTasks.filter(task => supportedTaskTypes.indexOf(task.taskType) >= 0);
    if (timelineTasks.find((item) => item.taskType === TASK_TYPE.SHORTLISTING_OUTCOME)) {  // ensure shortlisting outcome comes after shortlisting methods!
      let shortlistingOutcomeIndex = -1;
      let lastShortlistingMethodIndex = -1;
      timelineTasks.forEach((item, index) => {
        if (item.taskType === TASK_TYPE.SHORTLISTING_OUTCOME) shortlistingOutcomeIndex = index;
        if (
          (SHORTLISTING_TASK_TYPES.indexOf(item.taskType) >= 0)
          && index > lastShortlistingMethodIndex
        ) {
          lastShortlistingMethodIndex = index;
        }
      });
      if (lastShortlistingMethodIndex > shortlistingOutcomeIndex) {
        timelineTasks.splice(lastShortlistingMethodIndex, 0, timelineTasks.splice(shortlistingOutcomeIndex, 1)[0]);
      }
    }
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
    if (type === TASK_TYPE.EMP_TIEBREAKER) return APPLICATION_STATUS.SCC_TO_RECONSIDER;  // TODO: remove this eventually: override entry status for EMP tie-breakers
    const prevTaskType = previousTaskType(exercise, type);
    if (prevTaskType) {
      console.log('previousTaskType', prevTaskType);
      switch (prevTaskType) {
      case TASK_TYPE.CRITICAL_ANALYSIS:
      case TASK_TYPE.SITUATIONAL_JUDGEMENT:
      case TASK_TYPE.QUALIFYING_TEST:
        status = APPLICATION_STATUS.QUALIFYING_TEST_PASSED;
        break;
      case TASK_TYPE.SCENARIO:
        status = APPLICATION_STATUS.SCENARIO_TEST_PASSED;
        break;
      default:
        status = `${prevTaskType}Passed`;
      }
    }
    return status;
  }

  function finaliseScoreSheet(markingScheme, scoreSheet) {
    if (!scoreSheet) return {};
    if (!markingScheme) return scoreSheet;
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


  /**
   * includeZScores
   * Calculates z score for each item provided in the 'finalScores' param
   * * @param {*} `finalScores` array of objects where each object has the following shape:
   ```
   {
    score: Number,
    percent: Number,
    scoreSheet: {
      qualifyingTest: {
        CA: {
          score: Number,
          percent: Number,
        },
        SJ: {
          score: Number,
          percent: Number,
        },
        score: Number,
        percent: Number,
      },
    },
  }
  ```
   * @returns Provided `finalScores` array decorated with new `zScore` properties
   * Note: zScore = ((% Score – Mean(All % Scores))/SD(All % Scores))
   * Note: combined zScore has a weighting of 40% of CAT zScore plus 60% of SJT zScore
   **/
  function includeZScores(finalScores) {
    if (!finalScores) return [];
    if (!finalScores.length) return [];
    let CApercents = [];
    let SJpercents = [];
    try {
      finalScores.forEach(item => {
        CApercents.push(item.scoreSheet.qualifyingTest.CA.percent);
        SJpercents.push(item.scoreSheet.qualifyingTest.SJ.percent);
      });
      const CAmean = calculateMean(CApercents);
      const SJmean = calculateMean(SJpercents);
      const CAstdev = calculateStandardDeviation(CApercents);
      const SJstdev = calculateStandardDeviation(SJpercents);
      finalScores.forEach(item => {
        item.scoreSheet.qualifyingTest.CA.zScore = CAstdev ? (item.scoreSheet.qualifyingTest.CA.percent - CAmean) / CAstdev : 0;
        item.scoreSheet.qualifyingTest.SJ.zScore = SJstdev ? (item.scoreSheet.qualifyingTest.SJ.percent - SJmean) / SJstdev : 0;
      });
      finalScores.forEach(item => {
        item.zScore = (0.4 * item.scoreSheet.qualifyingTest.CA.zScore) + (0.6 * item.scoreSheet.qualifyingTest.SJ.zScore);
        item.scoreSheet.qualifyingTest.zScore = item.zScore;
      });
    } catch (e) {
      return finalScores;
    }
    return finalScores;
  }

};
