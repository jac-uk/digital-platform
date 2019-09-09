/*
 * A Google Apps Script that submits Google Form data to a Firebase function.
 *
 * Data will continue to be saved in the Form and on an attached spreadsheet if one has been used. All this script does is send a
 * copy of the data to the specified RESTFUL endpoint.
 */

function onSubmit(e) {
  const testSubmissionEndpoint = "ENDPOINT";

  const data = {
    simpleKey: 'SHARED SECRET',
    template: 'NOTIFY TEMPLATE ID',
    title: FormApp.getActiveForm().getTitle(),
    const itemResponses = e.response.getItemResponses();
    data.email = e.response.getRespondentEmail();

    itemResponses.forEach(function (itemResponse) {
      const item = itemResponse.getItem();
      // Get the question.
      const responseTitle = item.getTitle();
      const responseValue = itemResponse.getResponse();

      if (item.getType() == "CHECKBOX_GRID") {
        const userSelectedAnswers = {};

        /*
         * This is a one-liner to flatten an array of arrays.  It is a less-than-clear map reduce, or at least functions as such.
         * See:
         *
         * https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
         *
         * for more details.
         * This is done becaue Google Apps Script does not yet support `.flat()`.
         */
        const answersArray = [].concat.apply([], responseValue);

        const checkboxGrid = item.asCheckboxGridItem();
        const allRows = checkboxGrid.getRows();
        /* Build a keyed object because Firestore doesn't yet work with directly nested Arrays of Arrays *and*
         the format of `.getResponse()` when the question an array of checkboxes is exactly that:

         [['Most Appropriate'],null,null,null,['Least Appropriate'],null]

         Where the populated element indicates the row position of the user's chosen answer. It is an array
         because the checkbox grid needs to be able to deal with cases where there may be multiple answer columns chosen.
         We DO NOT support this format--anything other than two columns will cause problems. That said, these two columns can be
         named any way the ops teams/policy like.
         */
        checkboxGrid.getColumns().forEach(function (columnName) {
          columnName = columnName.toString();
          const chosenAnswer = allRows[answersArray.indexOf(columnName)];
          userSelectedAnswers[columnName] = chosenAnswer;
        });

        data[responseTitle] = userSelectedAnswers;
      } else {
        data[responseTitle] = responseValue;
      }
    });

    const options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data)
    };

    UrlFetchApp.fetch(testSubmissionEndpoint, options);
    console.info({ recordWritten: data.email });
    return true;
  }
