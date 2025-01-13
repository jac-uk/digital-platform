import lookup from '../../shared/converters/lookup.js';
import { getDocument, getDocuments, formatDate, formatAddress, formatPreviousAddresses, isValidDate } from '../../shared/helpers.js';
import _  from 'lodash';
import { isWorkingPreferenceColumn, filteredPreferences, extractAnswers, formatAnswers } from '../../shared/workingPreferencesHelper.js';
import initApplicationHelper from '../../shared/applicationHelper.js';

// TODO: check if this is still needed
function formatPreference(choiceArray, questionType) {
  if(questionType === 'multiple-choice') {
    return choiceArray instanceof Array ? choiceArray.map(x => `${x} ` ).join('and ').slice(0,-1) : choiceArray;
  } else if (questionType === 'ranked-choice') {
    return choiceArray instanceof Array ? choiceArray.map((x,index) => `${index+1}: ${x}`).join('. ') : choiceArray;
  } else if (questionType === 'single-choice') {
    return choiceArray;
  }
  return choiceArray;
}
export default (config, firebase, db, auth) => {
  const { formatExperience } = initApplicationHelper(config);


  return getApplicationData;

  /**
  * getApplicationData
   */
  async function getApplicationData(params) {

    const DEFAULT_VALUE = '- No answer provided -';
    let applicationDataRef = db.collection('applications')
    .where('exerciseId', '==', params.exerciseId);

    if (Array.isArray(params.statuses) && params.statuses.length) {
      applicationDataRef = applicationDataRef.where('status', 'in', params.statuses);
    }
    if (params.stage) {
      applicationDataRef = applicationDataRef.where('_processing.stage', '==', params.stage);
    }
    if (params.stageStatus) {
      applicationDataRef = applicationDataRef.where('_processing.status', '==', params.stageStatus);
    }

    const results = await getDocuments(applicationDataRef);

    let exerciseDataRef = db.collection('exercises').doc(params.exerciseId);
    const exerciseData = await getDocument(exerciseDataRef);

    const data = [];

    for(const result of results) {
      let record = {};
      for (const column of params.columns) {
        record[column] = _.get(result, column, DEFAULT_VALUE);
        // if key is blank or doesn't exist, set it to - No answer provided -
        if(record[column] === '' || record[column] === null) {
          record[column] = DEFAULT_VALUE;
        }
        else if (column.includes('additionalWorkingPreferences') && Object.prototype.hasOwnProperty.call(result, 'additionalWorkingPreferences')) {
          if (!Object.prototype.hasOwnProperty.call(result.additionalWorkingPreferences, (parseInt(column.replace('additionalWorkingPreferences ',''))))) {
            record[column] = DEFAULT_VALUE;
          } else {
            record[column] = formatPreference(
              (result.additionalWorkingPreferences  ? result.additionalWorkingPreferences[parseInt(column.replace('additionalWorkingPreferences ',''))].selection : '- No answer provided -'),
              exerciseData.additionalWorkingPreferences[parseInt(column.replace('additionalWorkingPreferences ',''))].questionType
            );
          }
        }
        // Handle Yes or No
        else if (['resignationFromDWP.workingAtDWP'].includes(column) &&  typeof record[column] === 'boolean') {
          record[column] = record[column] ? 'Yes' : 'No';
        }
        // Handle array values
        else if (['personalDetails.address.previous', 'personalDetails.VATNumbers', 'locationPreferences', 'jurisdictionPreferences'].includes(column)) {
          if (column === 'locationPreferences') {
            record[column] = formatPreference(record[column], exerciseData.locationQuestionType);
          }
          if (column === 'jurisdictionPreferences') {
            record[column] = formatPreference(record[column], exerciseData.jurisdictionQuestionType);
          }
          if (column === 'personalDetails.address.previous' && Array.isArray(record[column])) {
            record[column] = formatPreviousAddresses(record[column]);
          }
          if (column === 'personalDetails.VATNumbers' && Array.isArray(record[column])) {
            record[column] = record[column].map(item => item.VATNumber).join(',');
          }
        }
        else if (column === 'personalDetails.address.current' && _.isObject(record[column]) && !_.isArray(record[column])) {
          record[column] = formatAddress(record[column]);
        }
        else if(_.isArray(record[column])) {
          let formattedArray = [];
          for (const arrayItem of record[column]) {
            const arrayValuePaths = getArrayValuePath(column);
            if (arrayValuePaths) {
              const arr = [];
              for (const arrayValuePath of arrayValuePaths) {
                // check if endDate is empty and isOngoing is true
                if (arrayValuePath === 'endDate' && !arrayItem.endDate && arrayItem.isOngoing) {
                  arr.push('Ongoing');
                  continue;
                }

                const str = _.get(arrayItem, arrayValuePath, DEFAULT_VALUE);
                // handle time values
                let val = str;
                if (_.get(str, '_seconds', null) || isValidDate(str)) {
                  if (['experience', 'employmentGaps'].includes(column)) {
                    val = formatDate(str, 'MMM YYYY');
                  } else {
                    val = formatDate(str, 'DD/MM/YYYY');
                  }
                }
                arr.push(val);
              }
              formattedArray.push(arr.join(' - '));
            } else {
              formattedArray.push(arrayItem ? arrayItem : DEFAULT_VALUE);
            }
          }

          // if something went wrong with parsing the array, just return true
          if (formattedArray.length === 0) {
            record[column] = 'True';
          } else {
            record[column] = formattedArray.join(', ');
          }
        }
        else if (column === 'personalDetails.dateOfBirth') {
          if (record[column] !== DEFAULT_VALUE) {
            record[column] = formatDate(record[column], 'DD/MM/YYYY');
          }
        }
        
        // Handle working preferences
        if (isWorkingPreferenceColumn(column)) {
          const [preferenceKey, configId] = column.split('.');
          const configs = filteredPreferences(exerciseData, result, preferenceKey);
          const config = configs.find(c => c.id === configId);
          console.log('applicationId', result.id);
          const data = result[preferenceKey] ? result[preferenceKey][configId] : null;
          if (data !== null) {
            const source = exerciseData;
            const filters = { lookup };
            const answers = extractAnswers(config, data, source, filters);
            const formattedAnswers = formatAnswers(answers);
            record[column] = formattedAnswers.join(', '); 
          } else {
            record[column] = DEFAULT_VALUE;
          }

        }

        // Handle non-legal exercises experience
        if (column === 'experience' && exerciseData.typeOfExercise === 'non-legal') {
          record[column] = formatExperience(result, exerciseData).join(', ');
        }

        // Handle time values
        if(_.get(record[column], '_seconds', null)) {
          record[column] = formatDate(record[column], 'DD/MM/YYYY');
        }

      }

      data.push(record);
    }

    // where clause goes here
    if(params.whereClauses.length > 0 && params.columns.length > 0) {
      for(const whereClause of params.whereClauses) {
        _.remove(data, (el) => {
          let value = _.get(el, whereClause.column, '');
          value = value.toString().toLowerCase();
          whereClause.value = whereClause.value.toString().toLowerCase();
          switch (whereClause.operator) {
            case '==':
              // eslint-disable-next-line eqeqeq
              return value != whereClause.value;
            case '!=':
              // eslint-disable-next-line eqeqeq
              return value == whereClause.value;
          }
          return false;
        });
      }
    }

    if(params.type === 'count') {
      let countData = {};
      for (const column of params.columns) {
          countData[column] = _.countBy(data, column);
      }
      return countData;
    }
    return data;
  }

  function getArrayValuePath(column) {
    const arrayValuePaths = {
      qualifications: ['type', 'location', 'date'],
      experience: ['jobTitle', 'startDate', 'endDate'],
      employmentGaps: ['details', 'startDate', 'endDate'],
    };
    return arrayValuePaths[column];
  }

};
