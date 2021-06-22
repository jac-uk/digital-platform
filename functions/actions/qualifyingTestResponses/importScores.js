const { getDocument } = require('../../shared/helpers');
const admin = require('firebase-admin');
const ExcelJS = require('exceljs');

let failedRows = [];
let rowsImported = 0;

module.exports = (config, firebase, db) => {

  return {
    importScores,
  };

  /**
   * Imports qualifying test scores from a spreadsheet, uploaded by an admin
   * @param qualifyingTestId
   * @param fullFilePath
   */
  async function importScores(qualifyingTestId, fullFilePath) {

    failedRows = [];
    rowsImported = 0;

    // get storage service
    const bucket = admin.storage().bucket(config.STORAGE_URL);
    fullFilePath = (fullFilePath.charAt(0) === '/') ? fullFilePath.substr(1) : fullFilePath;



    // get spreadsheet data - returns an object containing headers and contents
    const spreadsheetData = await getSpreadsheetData(bucket, fullFilePath);

    // columns that start with Score Q{{question_number}}
    const scoreColumns = [];

    // the column that contains the QT response id (uses "ID" as a lookup)
    let qtResponseIdColumn = 0;

    // Get the headers and try to identify which columns contain the QT response ID and which ones contain Scores
    spreadsheetData.headers.forEach((header,index) => {
      if(header === 'ID') {
        qtResponseIdColumn = index;
      }

      if(header.startsWith('Score Q')) {

        // get the question number by extracting the numbers from the header
        // get the index by subtracting 1 from the question number. E.g. Score Q1 becomes 0
        const questionNumberIndex = parseInt(header.replace( /^\D+/g, '')) - 1;
        scoreColumns.push({
          headerName: header,
          headerIndex:index,
          questionNumberIndex: questionNumberIndex,
        });
      }
    });

    await Promise.all(spreadsheetData.contents.map(async (row, rowNumber) => {
      const qtScores = [];
      let hasErrors = false;

        // check the qualifyingTestResponseId is set for the row
        const qtResponseId = row[qtResponseIdColumn];

        if(!qtResponseId) {
          hasErrors = true;
          addFailedRow(rowNumber, 'No QT Response ID found within the spreadsheet');
        }

        if(!hasErrors) {
          scoreColumns.forEach((scoreColumn, index) => {
            const score = row[scoreColumn.headerIndex];

            // check if any of the scores are malformed
            if(isNaN(score)) {
              hasErrors = true;
              addFailedRow(rowNumber, `Score: ${score} is not a number`);
            } else {
              qtScores.push({questionNumberIndex: scoreColumn.questionNumberIndex, score: score});
            }
          });
        }

        if(!hasErrors) {
          let qualifyingTestResponse = await getDocument(
            db.collection('qualifyingTestResponses')
              .doc(qtResponseId)
          );

          // if no QT response is found, or the QT response is for a different QT, return an error
          if(!qualifyingTestResponse || !qualifyingTestResponse.qualifyingTest || qualifyingTestResponse.qualifyingTest.id !== qualifyingTestId) {
            hasErrors = true;
            addFailedRow(rowNumber, `The QT response with ID '${qtResponseId}' was not found within this Qualifying Test`);
          } else {

            let responses = qualifyingTestResponse.responses;

            if(responses && responses[0].responsesForScenario) {
              // edit each question score
              qtScores.forEach((qtScore) => {
                if(qtScore.score) { // if score is not blank
                  //TODO: allow for multiple scenarios within the test here (responses[0]) - dependant on confirmation of excel format
                  let response = responses[0].responsesForScenario[qtScore.questionNumberIndex];
                  response.score = qtScore.score;
                  responses[0].responsesForScenario[qtScore.questionNumberIndex] = response;
                }
              });
            } else {
              hasErrors = true;
              addFailedRow(rowNumber, 'No responses could be found for this Qualifying Test');
            }


            // update qt response with new scores
            await db.collection('qualifyingTestResponses').doc(qtResponseId).update({
              responses: responses,
            });

            rowsImported++;

          }
        }

    }));

    return {successfullyImported: rowsImported, rowsNotImported: failedRows};

  }
  async function getSpreadsheetData (bucket, fullFilePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(bucket.file(fullFilePath).createReadStream());
    const worksheet = workbook.worksheets[0];
    const headers = worksheet.getRow(1).values;
    const contents = [];
    worksheet.eachRow(async (row, rowNumber) => {
      if(rowNumber > 1) {
        contents.push(row.values);
      }
    });

    return {headers: headers, contents: contents};
  }

  function addFailedRow(index, comment) {

    // row numbers need to be incremented by 2.
    // +1 because row numbers start at 1 in excel (vs arrays starting at 0)
    // +1 because the first row in the excel template is expected to be a header.
    // so failedRows[0] equates to Row 2 in excel
    failedRows.push({rowNumber: index + 1 + 1, rowError: comment});
  }
};


