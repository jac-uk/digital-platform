const { getDocument, getDocuments, formatDate, formatAddress, formatPreviousAddresses, isValidDate } = require('../../shared/helpers');

const _ = require('lodash');

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

module.exports = (config, firebase, db, auth) => {

  return getApplicationData;

  /**
  * getApplicationData
   */
  async function getApplicationData(params) {

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
        record[column] = _.get(result, column, '- No answer provided -');
        // if key is blank or doesn't exist, set it to - No answer provided -
        if(record[column] === '' || record[column] === null) {
          record[column] = '- No answer provided -';
        }
        else if (column.includes('additionalWorkingPreferences') && Object.prototype.hasOwnProperty.call(result, 'additionalWorkingPreferences')) {
          if (!Object.prototype.hasOwnProperty.call(result.additionalWorkingPreferences, (parseInt(column.replace('additionalWorkingPreferences ',''))))) {
            record[column] = '- No answer provided -';
          } else {
            record[column] = formatPreference(
              (result.additionalWorkingPreferences  ? result.additionalWorkingPreferences[parseInt(column.replace('additionalWorkingPreferences ',''))].selection : '- No answer provided -'),
              exerciseData.additionalWorkingPreferences[parseInt(column.replace('additionalWorkingPreferences ',''))].questionType
            );
          }
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
                const str = _.get(arrayItem, arrayValuePath, '- No answer provided -');
                // Handle time values
                const val = _.get(str, '_seconds', null) || isValidDate(str) ? formatDate(str, 'DD/MM/YYYY') : str;
                arr.push(val);
              }
              formattedArray.push(arr.join(' - '));
            } else {
              formattedArray.push(arrayItem ? arrayItem : '- No answer provided -');
            }
          }

          // if something went wrong with parsing the array, just return true
          if (formattedArray.length === 0) {
            record[column] = 'True';
          } else {
            record[column] = formattedArray.join(', ');
          }
        } else if (column === 'personalDetails.dateOfBirth') {
          record[column] = formatDate(record[column], 'DD/MM/YYYY');
        }

        // Handle time values
        if(_.get(record[column], '_seconds', null)) {
          record[column] = formatDate(record[column]);
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
    };
    return arrayValuePaths[column];
  }

};
