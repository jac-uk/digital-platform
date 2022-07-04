const { getDocument, getDocuments, formatDate } = require('../../shared/helpers');

const _ = require('lodash');
const { get } = require('lodash');

//work on singlechoice

function formatPreference(choiceArray, questionType) {
  console.log(choiceArray);
  if(typeof choiceArray === Array) {
    if(questionType === 'multiple-choice') {
      console.log(choiceArray.map(x => `${x} - ` ).join('. ').slice(0,-1));
      return choiceArray.map(x => `${x} - ` ).join('. ').slice(0,-1);
    } else if (questionType === 'ranked-choice') {
      console.log(choiceArray.map((x,index) => `${index+1}: ${x}`).join('. '));
      return choiceArray.map((x,index) => `${index+1}: ${x}`).join('. ');
    } else {
      }
  } else {    
    // Single Choice or Single Answer
      console.log(choiceArray);
      return choiceArray;
  }
};

module.exports = (config, firebase, db, auth) => {

  return {
    getApplicationData,
  };

  /**
  * getApplicationData
   */
  async function getApplicationData(params) {
    
    let applicationDataRef = db.collection('applications')
    .where('exerciseId', '==', params.exerciseId);
    
    const results = await getDocuments(applicationDataRef);
    
    let exerciseDataRef = db.collection('exercises').doc(params.exerciseId);
    const exerciseData = await getDocument(exerciseDataRef);
    
    const data = [];
    
    // console.log(exerciseData.additionalWorkingPreferences.questionType);
    for(const result of results) {
      let record = {};
      for(const column of params.columns) {
        record[column] = _.get(result, column, '- No answer provided -');
        let formattedArray = '';      
        // Handle array values, EXCLUDING location, juristiction, and additional
        if(_.isArray(record[column]) && !([
          'locationPreferences',
          'jurisdictionPreferences',
          'additionalWorkingPreferences'
        ].includes(column))) {
          for (const arrayItem of record[column]) {
            const arrayValuePaths = getArrayValuePath(column);
            if(arrayValuePaths) {
              for (const arrayValuePath of arrayValuePaths) {
                const str = _.get(arrayItem, arrayValuePath, '- No answer provided -');
                // Handle time values
                formattedArray += (_.get(str, '_seconds', null) ? formatDate(str) : str) + ' - ';
              }
              // remove the last ' - ' from string
              formattedArray = formattedArray.substring(0, formattedArray.length - 3);
            } 
            else {
              formattedArray += arrayItem ? arrayItem : '- No answer provided -';
            }
            formattedArray += ', ';
            // remove the last ', ' from string
            formattedArray = formattedArray.substring(0, formattedArray.length - 2);
          }
        }
        else if (column === 'locationPreferences') {
          formattedArray = formatPreference(record[column], exerciseData.locationQuestionType);
        } 
        else if (column === 'jurisdictionPreferences') {
          formattedArray = formatPreference(record[column], exerciseData.jurisdictionQuestionType);
        }
        else if (column.slice(0,-2) === 'additionalWorkingPreferences') {
          // exerciseData.additionalWorkingPreferences.forEach((question, index) => {
            // console.log(record);
            console.log(record);
            // formattedArray = formatPreference(record[column][column.slice(column.length - 1)].selection, exerciseData.additionalWorkingPreferences[parseInt(column.slice(column.length - 1))-1].questionType);
          // })
        }
        // if key doesn't exist or it's blank, set it to - No answer provided -
        else if(record[column] === '' || record[column] === null) {
          record[column] = '- No answer provided -';
        }  
        
        // if something went wrong with parsing the array, just return true
        if (formattedArray === '') {
          record[column] = 'True';
        } else {
          record[column] = formattedArray;
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
    // console.log(data);
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
