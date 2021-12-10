// TODO sort out firestore date formatting

const htmlWriter = require('../htmlWriter');
const {addField} = require('./helpers');
const _ = require('lodash');

module.exports = () => {

  return {
    getHtmlQualifyingTestResponse,
  };

  function getHtmlQualifyingTestResponse(qtr, exercise, application, params = {}) {
    let html = new htmlWriter();

    if (params && params.showNames) {
      html.addTitle(`${application.personalDetails.fullName} ${application.referenceNumber}`);
    } else {
      html.addTitle(application.referenceNumber);
    }

    html.addHeading(qtr.qualifyingTest.title);

    html.addTable(getQTInfo(qtr));

    qtr.testQuestions.questions.forEach((s, sidx) => {
      html.addHeading(`Scenario ${sidx + 1}`);

      s.options.forEach((q, qidx) => {
        const qData = [];
        const answer = _.get(qtr, `responses.${sidx}.responsesForScenario.${qidx}.text`, '');
        addField(qData, `Question ${qidx + 1}`, q.question);
        addField(qData, 'Words/Word Limit', answer.split(' ').length + '/' + _.get(q, 'wordLimit', ' N/A'));
        addField(qData, 'Answer:', '');

        html.addTable(qData);
        html.addParagraph(' ');
        html.addParagraph(answer);
      });
    });

    return html.toString();
  }

  function getQTInfo(qtResponse) {
    const data = [];
    addField(data, 'Instructions', _.get(qtResponse, 'qualifyingTest.additionalInstructions', []).map(i => i.text).join(' - '));
    return data;
  }
};
