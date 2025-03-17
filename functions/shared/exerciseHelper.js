import { formatDate } from './helpers.js';
import lookup from './converters/lookup.js';
import _ from 'lodash';
import { EXERCISE_STAGE } from './constants.js';

export default () => {
  const SELECTION_CATEGORIES = {
    LEADERSHIP: {
      value: 'leadership',
      label: 'Leadership',
      description: 'Strategic Leadership Questions',
    },
    ROLEPLAY: {
      value: 'roleplay',
      label: 'Roleplay',
      description: 'Role Play',
    },
    SITUATIONAL: {
      value: 'situational',
      label: 'Situational',
      description: 'Situational Questions',
    },
    INTERVIEW: {
      value: 'interview',
      label: 'Interview',
      description: 'Interview',
    },
    OVERALL: {
      value: 'overall',
      label: 'Overall',
      description: 'Overall',
    },
  };

  return {
    SELECTION_CATEGORIES,
    availableStages,
    isStagedExercise,
    canApplyFullApplicationSubmitted,
    applicationCounts,
    shortlistingMethods,
    formatSelectionDays,
  };

  function availableStages(exercise) {
    const stages = [];
    if (!exercise) return stages;
    if (exercise._processingVersion >= 2) {
      stages.push(EXERCISE_STAGE.SHORTLISTING);
      stages.push(EXERCISE_STAGE.SELECTION);
      stages.push(EXERCISE_STAGE.SCC);
      stages.push(EXERCISE_STAGE.RECOMMENDATION);
    } else {
      stages.push(EXERCISE_STAGE.REVIEW);
      stages.push(EXERCISE_STAGE.SHORTLISTED);
      stages.push(EXERCISE_STAGE.SELECTED);
      stages.push(EXERCISE_STAGE.RECOMMENDED);
      stages.push(EXERCISE_STAGE.HANDOVER);
    }
    return stages;
  }

  function isStagedExercise(exercise) {
    if (!exercise) return false;
    const selectionProcess = (exercise._applicationContent && exercise._applicationContent.selection) || {};
    const isStagedExercise = Object.values(selectionProcess).includes(true);
    return isStagedExercise;
  }

  function canApplyFullApplicationSubmitted(exercise) {
    if (!exercise) return false;

    const applyFullApplicationSubmitted = isStagedExercise(exercise) && exercise.applicationOpenDate.toDate() >= new Date(2024, 7, 18);
    console.log('applyFillApplicationSubmitted', applyFullApplicationSubmitted);

    return applyFullApplicationSubmitted;
  }

  function applicationCounts(exercise) {
    const applicationCounts = exercise && exercise._applications ? { ...exercise._applications } : {};
    // include withdrawn applications in applied count
    if (applicationCounts && applicationCounts.applied) {
      applicationCounts.applied = applicationCounts.applied + (applicationCounts.withdrawn || 0);
    }
    return applicationCounts;
  }

  function shortlistingMethods(exercise) {
    const methods = exercise.shortlistingMethods;
    if (!(methods instanceof Array)) {
      return [];
    }
    const list = methods.filter(value => (value !== 'other'));
    list.sort();

    if (methods.includes('other')) {
      exercise.otherShortlistingMethod.forEach((method) => {
        return list.push(method.name);
      });
    }

    const lookupList = list.map((method) => {
      return lookup(method);
    });

    return lookupList;
  }

  function formatSelectionDays(exercise) {
    if (!exercise || !exercise.selectionDays) {
      return [];
    }

    let dateStrings = [];

    for (const selectionDay of exercise.selectionDays) {
      let dateString = '';
      const selectionDayStart = formatDate(selectionDay.selectionDayStart, 'DD/MM/YYYY');
      const selectionDayEnd = formatDate(selectionDay.selectionDayEnd, 'DD/MM/YYYY');

      if (!selectionDayStart || !selectionDayEnd) {
        dateString = '';
      } else if (selectionDayStart !== selectionDayEnd) {
        dateString = `${selectionDayStart} to ${selectionDayEnd}`;
      } else {
        dateString = `${selectionDayStart}`;
      }
      if (!_.isEmpty(dateString)) {
        if (selectionDay.selectionDayLocation) {
          dateString = `${selectionDay.selectionDayLocation} - ${dateString}`;
        }
        dateStrings.push(dateString);
      }
    }

    return dateStrings;
  }
};
