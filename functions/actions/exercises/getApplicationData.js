const { getDocuments, formatDate } = require('../../shared/helpers');

const _ = require('lodash');

module.exports = (config, firebase, db, auth) => {

  return {
    getApplicationData,
  };

  /**
  * getApplicationData
  */
  async function getApplicationData(params) {

    let dataRef = db.collection('applications')
      .where('exerciseId', '==', params.exerciseId);

    const results = await getDocuments(dataRef);

    const data = [];

    for(const result of results) {
      let record = {};
      for(const column of params.columns) {

        record[column] = _.get(result, column, '(blank)');
        // if key doesn't exist or it's blank, set it to (blank)
        if(record[column] === '' || record[column] === null) {
          record[column] = '(blank)';
        }

        // Handle array values
        if(_.isArray(record[column])) {
          let formattedArray = '';
          for (const arrayItem of record[column]) {
            const arrayValuePaths = getArrayValuePath(column);
            if(arrayValuePaths) {
              for (const arrayValuePath of arrayValuePaths) {
                const str = _.get(arrayItem, arrayValuePath, '(blank)');
                // Handle time values
                formattedArray += (_.get(str, '_seconds', null) ? formatDate(str) : str) + ' - ';
              }
              // remove the last ' - ' from string
              formattedArray = formattedArray.substring(0, formattedArray.length - 3);
            } else {
              formattedArray += arrayItem ? arrayItem : '(blank)';
            }
            formattedArray += ', ';
          }

          // remove the last ', ' from string
          formattedArray = formattedArray.substring(0, formattedArray.length - 2);

          // if something went wrong with parsing the array, just return true
          if (formattedArray === '') {
            record[column] = 'True';
          } else {
            record[column] = formattedArray;
          }
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
