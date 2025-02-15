/*eslint func-style: ["error", "declaration"]*/

export {
  // OUTCOME,
  // OVERRIDE_REASON,
  // getOverrideReasons,
  // isPass,
  // isPassingScore,
  getOverride
  // getDefaultOutcome,
  // getCurrentOutcome,
  // getNewOutcome,
};

// function getOverride() {
//   console.log('getOverride');
//   return false;
// }

const OUTCOME = {
  PASS: {
    value: 'pass',
    label: 'Pass',
  },
  FAIL: {
    value: 'fail',
    label: 'Fail',
  },
};

// const OVERRIDE_REASON = {
//   EMP_GENDER: {
//     code: 'g',
//     value: 'emp-gender',
//     label: 'EMP applied on basis of gender',
//   },
//   EMP_ETHNICITY: {
//     code: 'e',
//     value: 'emp-ethnicity',
//     label: 'EMP applied on basis of ethnicity',
//   },
//   TECHNICAL: {
//     code: 't',
//     value: 'technical',
//     label: 'Technical glitches encountered',
//   },
//   PERSONAL: {
//     code: 'p',
//     value: 'personal',
//     label: 'Personal circumstances',
//   },
// };

// function getOverrideReasons() {
//   return Object.values(OVERRIDE_REASON);
// }

// function convertOverrideCode2Value(code) {
//   const match = getOverrideReasons().find(reason => reason.code === code);
//   return match ? match.value : '';
// }

// function convertOverrideValue2Code(value) {
//   const match = getOverrideReasons().find(reason => reason.value === value);
//   return match ? match.code : '';
// }

// function isPassingScore(task, score) {
//   if (task && task.passMark && task.passMark <= score) {
//     return true;
//   }
//   return false;
// }

// function isPass(task, applicationId, score) {
//   const override = getOverride(task, applicationId);
//   if (override) {
//     return override.outcome === OUTCOME.PASS.value;
//   }
//   if (isPassingScore(task, score)) {
//     return true;
//   }
//   return false;
// }

// function getDefaultOutcome(task, score) {
//   if (isPassingScore(task, score)) {
//     return OUTCOME.PASS;
//   } else {
//     return OUTCOME.FAIL;
//   }
// }

// function getNewOutcome(task, score) {
//   if (isPassingScore(task, score)) {
//     return OUTCOME.FAIL;
//   } else {
//     return OUTCOME.PASS;
//   }
// }

// function getCurrentOutcome(task, score) {
//   if (isPass(task, score)) {
//     return OUTCOME.PASS;
//   } else {
//     return OUTCOME.FAIL;
//   }
// }

/**
 * function getOverride(task, applicationId)
 * @param {*} task 
 * @param {*} applicationId 
 * @returns false or an `override` object of the form `{ id: string, outcome: enum('pass', 'fail'), reason: enum('emp-gender', 'emp-ethnicity', 'technical', 'personal') }`
 */
function getOverride(task, applicationId) {
  if (!task) return false;
  if (!task.overrides) return false;

  if (task.overrides.pass) {
    if (Array.isArray(task.overrides.pass)) {   // BACKWARDS COMPATIBILITY: we used to store IDs in an array
      if (task.overrides.pass.indexOf(applicationId) >= 0) {
        return {
          outcome: OUTCOME.PASS.value,
          id: applicationId,
        };  
      } else {
        return false;
      }
    }
    if (task.overrides.pass[applicationId]) {
      return {
        outcome: OUTCOME.PASS.value,
        id: applicationId,
        reason: task.overrides.pass[applicationId],
      };
    }
  }

  if (task.overrides.fail) {
    if (Array.isArray(task.overrides.fail)) {   // BACKWARDS COMPATIBILITY: we used to store IDs in an array
      if (task.overrides.fail.indexOf(applicationId) >= 0) {
        return {
          outcome: OUTCOME.FAIL.value,
          id: applicationId,
        };  
      } else {
        return false;
      }
    }
    if (task.overrides.fail[applicationId]) {
      return {
        outcome: OUTCOME.FAIL.value,
        id: applicationId,
        reason: task.overrides.fail[applicationId],
      };
    }
  }

  return false;
}
