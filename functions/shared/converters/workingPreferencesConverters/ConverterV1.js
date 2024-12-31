import { addField } from '../helpers.js';
import { objectHasNestedProperty } from '../../helpers.js';

class ConverterV1 {
  
  getJurisdictionPreferences(application, exercise) {
    const data = [];
    if (objectHasNestedProperty(application, 'jurisdictionPreferences')) {
      if (typeof (application.jurisdictionPreferences) === 'string') {
        addField(data, exercise.jurisdictionQuestion, application.jurisdictionPreferences);
      } else if (Array.isArray(application.jurisdictionPreferences)) {
        let htmlListStr  = '<ul>';
        application.jurisdictionPreferences.forEach(item => {
          htmlListStr += `<li>${item}</li>`;
        });
        htmlListStr += '</ul>';
        addField(data, exercise.jurisdictionQuestion, htmlListStr);
      }
    }
    return data;
  }

  getLocationPreferences(application, exercise) {
    const data = [];
    if (objectHasNestedProperty(application, 'locationPreferences')) {
      if (typeof (application.locationPreferences) === 'string') {
        addField(data, exercise.locationQuestion, application.locationPreferences);
      } else if (Array.isArray(application.locationPreferences)) {
        let htmlListStr  = '<ul>';
        application.locationPreferences.forEach(item => {
          htmlListStr += `<li>${item}</li>`;
        });
        htmlListStr += '</ul>';
        addField(data, exercise.locationQuestion, htmlListStr);
      }
    }
    return data;
  }

  getAdditionalWorkingPreferences(application, exercise) {
    const data = [];

    if (objectHasNestedProperty(application, 'additionalWorkingPreferences')) {
      const additionalWorkingPreferenceData = application.additionalWorkingPreferences;
      if (Array.isArray(additionalWorkingPreferenceData)) {
        additionalWorkingPreferenceData.forEach((item, index) => {
          if (exercise.additionalWorkingPreferences[index].questionType === 'single-choice') {
            addField(data, exercise.additionalWorkingPreferences[index].question, item.selection);
          }
          else if (exercise.additionalWorkingPreferences[index].questionType === 'multiple-choice') {
            if (item.selection) {
              const answers = item.selection.join('<br />');
              addField(data, exercise.additionalWorkingPreferences[index].question, answers);
            } else {
              addField(data, exercise.additionalWorkingPreferences[index].question, 'No answer provided');
            }
          }
          else if (exercise.additionalWorkingPreferences[index].questionType === 'ranked-choice') {
            if (item.selection) {
              const rankedAnswer = [];
              item.selection.forEach((choice, index) => {
                rankedAnswer.push(`${index + 1}: ${choice}`);
              });
              addField(data, exercise.additionalWorkingPreferences[index].question, rankedAnswer.join('<br />'));
            } else {
              addField(data, exercise.additionalWorkingPreferences[index].question, 'No answer provided');
            }
          }
        });
      }
    }
    return data;
  }
}

export { ConverterV1 };
