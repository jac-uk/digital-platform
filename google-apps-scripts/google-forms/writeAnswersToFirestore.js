const testSubmissionEndpoint = "<change to correct endpoint>";

function onSubmit(e) {
  const form = FormApp.getActiveForm();
  const data = { title: form.getTitle() };

  const itemResponses = e.response.getItemResponses();
  data.email = e.response.getRespondentEmail();

  itemResponses.forEach(function (itemResponse) {
    const item = itemResponse.getItem();
    // Get the question.
    const responseTitle = itemResponse.getItem().getTitle();
    const responseValue = itemResponse.getResponse();
    const gridAnswers = {};

    if (itemResponse.getItem().getType() == "CHECKBOX_GRID") {
      const answersArrayOfArrays = responseValue;
      // Because gs doesn't have .flat()
      const answersArray = [].concat.apply([], answersArrayOfArrays);
      const rows = item.asCheckboxGridItem().getRows();

      /* Build a keyed object because Firestore doesn't yet work with directly nested Arrays of Arrays *and*
         the format of `.getResponse()` when the question an array of checkboxes is unusual:

         [['Most Appropriate'],null,null,null,['Least Appropriate'],null]

         Where the populated element indicates the row position of the user's chosen answer. It is an array
         because the checkbox grid needs to be able to deal with cases where there may be multiple answer columns chosen.
         We DO NOT support this format--anything other than two columns will cause problems.
         */
      item.asCheckboxGridItem().getColumns().forEach(function (key) {
        gridAnswers[key.toString()] = rows[answersArray.indexOf(key)];
      });

      data[responseTitle] = gridAnswers;
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
