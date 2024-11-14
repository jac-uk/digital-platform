import { addField } from '../helpers.js';
import isObject from 'lodash/isObject.js';
import orderBy from 'lodash/orderBy.js';
import get from 'lodash/get.js';

class ConverterV2 {
  logError(msg, questionId, application, exercise) {
    console.log(`${msg} for questionId: ${questionId} in applicationId ${application.id} in exercise ${exercise.name}`);
  }

  arrayToHtmlList(list) {
    const listItems = list.map(item => `<li>${item}</li>`);
    const htmlList = `<ul>${listItems.join('')}</ul>`;
    return htmlList;
  }

  rankedArrayToHtmlList(list) {
    // Create an empty string to hold the HTML content
    let html = '';
  
    // Iterate over each answer
    list.forEach(answer => {
      // If answer has at least one value
      if (answer.answer.length > 0) {
        // Add rank and answers to the HTML string
        html += `<li>${answer.rank}: ${answer.answer.join(', ')}</li>`;
      }
    });
  
    // Wrap the HTML content with <ul> tags
    html = `<ul>${html}</ul>`;
  
    // Return the generated HTML
    return html;
  }

  /**
   * 
   * @param {*} possibleAnswers 
   * @param {*} myAnswers
   * @returns 
   */
  groupedRankedArrayToHtmlList(possibleAnswers, myAnswers) {

    // myAnswers, eg  eg { ntd: 1, mty: 2, web: 3, gtc: 2, tlc: 2}

    const transformedObject = {};
    for (const key in myAnswers) {
      const value = myAnswers[key];
      if (transformedObject[value]) {
        transformedObject[value].push(key);
      } else {
        transformedObject[value] = [key];
      }
    }

    // transformedObject, eg { '1': [ 'ntd' ], '2': [ 'mty', 'gtc', 'tlc' ], '3': [ 'web' ] }

    const result = {};
    Object.entries(transformedObject).forEach(([rank, answers]) => {
      const matches = [];
      for (let j=0; j<answers.length; ++j) {
        const answerId = answers[j];
        for (let i=0; i<possibleAnswers.length; ++i) {
          const possibleAnswer = possibleAnswers[i];
          const group = possibleAnswer.group;
          const match = Array.prototype.find.call(possibleAnswer.answers, a => a.id === answerId);
          if (match) {
            match.group = group;
            matches.push(match);
          }
        }
      }
      result[rank] = orderBy(matches, ['group'], ['asc']);
    });

    // result, eg
    // '2': [
    //   { answer: 'answer 2', id: 'mty', group: 'Group 1' },
    //   { answer: 'answer 3', id: 'gtc', group: 'Group 2' },
    // ],

    // Build nested html lists
    let html = '';
    html += '<ul>';
    Object.entries(result).forEach(([rank, resultAnswers]) => {
      html += `<li>${rank}:`;
      let currentGroup = null;
      for (let i=0; i<resultAnswers.length; ++i) {
        const resultAnswer = resultAnswers[i];
        const group = resultAnswer.group;
        if (i === 0) {
          html += `<ul><li>${group}:<ul>`;
        }
        else if (group !== currentGroup && (i !== (resultAnswers.length - 1))) {
          html += `</ul></li><li>${group}:<ul>`;
        }
        html += `<li>${resultAnswer.answer}</li>`;
        currentGroup = group;
        if (i === (resultAnswers.length - 1)) {
          html += '</ul></li></ul>';
        }
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  jurisdictionRankedArrayToHtmlList(inputObject) {
    // Initialize an empty object to store the result
    const resultObject = {};

    // Iterate over the keys and values of the input object
    for (const [key, value] of Object.entries(inputObject)) {
        // If the value doesn't exist as a key in the result object, create an array with the key as the value
        if (!resultObject[value]) {
            resultObject[value] = [key];
        } else {
            // If the value already exists as a key in the result object, push the key to the corresponding array
            resultObject[value].push(key);
        }
    }

    // resultObject = { 1: ['civil','family'], 2: ['crime']}

    // Create an empty string to hold the HTML content
    let html = '';
      
    for (const rank in resultObject) {
      if (Object.prototype.hasOwnProperty.call(resultObject, rank)) {
          const answersArr = resultObject[rank];
          // Add rank and answers to the HTML string
          html += `<li>${rank}: ${answersArr.join(', ')}</li>`;
      }
    }
    // Wrap the HTML content with <ul> tags
    html = `<ul>${html}</ul>`;

    // Return the generated HTML
    return html;
  }

  getJurisdictionPreferences(application, exercise) {    
    let questionId = null;
    let answerId = null;

    const data = [];

    if ('jurisdictionPreferences' in application && isObject(application.jurisdictionPreferences)) {
      for (const [questionId, answerId] of Object.entries(application.jurisdictionPreferences)) {
        const questionObj = Array.prototype.find.call(exercise.jurisdictionPreferences, (q) => q.id === questionId);
        if (questionObj) {
          const question = questionObj.question;
          const questionType = questionObj.questionType;
          const groupAnswers = questionObj.groupAnswers;
          const answerSource = get(questionObj, 'answerSource', '');
  
          // SINGLE CHOICE
          if (questionType === 'single-choice' && typeof (answerId) === 'string') {
            const answerObj = Array.prototype.find.call(questionObj.answers, (a) => a.id === answerId);
            if (get(answerObj, 'answer', false)) {
              const answer = answerObj.answer;
              addField(data, question, answer);
            }
            else {
              throw new Error('Answer obj does not have an answer field');
            }
          }
  
          // MULTIPLE CHOICE
          else if (questionType === 'multiple-choice' && Array.isArray(answerId)) {    
            // GROUPED => Ignored for Jurisdiction Questions      
            // NOT GROUPED
            addField(data, question, this.arrayToHtmlList(answerId));
          }
          
          // RANKED CHOICE
          else if (questionType === 'ranked-choice' && isObject(answerId)) {
  
            // Get the answers as a list
            if (answerSource) {
              addField(data, question, this.jurisdictionRankedArrayToHtmlList(answerId));
            }
            else {
              const obj = {};
              for (const [ansId, rank] of Object.entries(answerId)) {
                const answerObj = Array.prototype.find.call(questionObj.answers, (answer) => answer.id === ansId);
                if (answerObj) {
                  obj[answerObj.answer] = rank;
                  // => { 'answer 1': 1, 'answer 8': 2, 'answer 11': 1 };
                }
              }
              addField(data, question, this.jurisdictionRankedArrayToHtmlList(obj));
            }
          }
        }
      }
    }
    return data;
  }

  getGenericPreferences(application, exercise, preferencesType) {
    let questionId = null;
    let answerId = null;
    const data = [];

    if (preferencesType in exercise && isObject(exercise[preferencesType])) {
      for (const questionObj of exercise[preferencesType]) {
        const questionId = questionObj.id;
        const answerId = get(application, [preferencesType, questionId], null);
        if (answerId) {
          const question = questionObj.question;
          const questionType = questionObj.questionType;
          const groupAnswers = questionObj.groupAnswers;
  
          // SINGLE CHOICE
  
          if (questionType === 'single-choice' && typeof (answerId) === 'string') {
            const answerObj = Array.prototype.find.call(questionObj.answers, (answer) => answer.id === answerId);
            if (answerObj.answer) {
              const answer = answerObj.answer;
              addField(data, question, answer);
            }
            else {
              throw new Error('Answer obj does not have an answer field');
            }
          }
  
          // MULTIPLE CHOICE
  
          else if (questionType === 'multiple-choice' && Array.isArray(answerId)) {
            // GROUPED
            if (groupAnswers) {
              const result = [];
              questionObj.answers.forEach(element => {
                  const resultObj = {
                    group: element.group,
                  };
                  const ansObj = Array.prototype.find.call(element.answers, (answer) => answerId.includes(answer.id));
                  resultObj.answer = ansObj.answer;
                  result.push(resultObj);
  
              });
              // Get the answers as a list
              addField(data, question, this.arrayToHtmlList(result.map(o => `${o.group} - ${o.answer}`)));
            }
            // NOT GROUPED
            else {
              const answers = questionObj.answers.filter(answer => answerId.includes(answer.id)).map(o => o.answer);
              addField(data, question, this.arrayToHtmlList(answers));
            }
          }
  
          // RANKED CHOICE
  
          else if (questionType === 'ranked-choice' && isObject(answerId)) {
            if (groupAnswers) { // GROUPED
              addField(data, question, this.groupedRankedArrayToHtmlList(questionObj.answers, answerId));
            }
            else { // NOT GROUPED
              // Group possible answers by rank
              const groupedAnswers = Object.entries(answerId).reduce((acc, [id, rank]) => {
                acc[rank] = acc[rank] || [];
                const foundAnswer = questionObj.answers.find(answer => answer.id === id);
                if (foundAnswer) {
                    acc[rank].push(foundAnswer.answer);
                }
                return acc;
            }, {});
  
              // Map grouped answers to the desired format
              const results = Object.entries(groupedAnswers).map(([rank, answers]) => ({
                rank: parseInt(rank),
                answer: answers.filter(Boolean),
              }));
    
              // Get the answers as a list
              addField(data, question, this.rankedArrayToHtmlList(results));
            }
          }
        }
        //else { // fix ts-436 the preference question may be optional, so the answer may not exist
        //  throw new Error('Unable to find location preferences question id');
        //}
      }
    }

    return data;
  }

  getLocationPreferences(application, exercise) {
    return this.getGenericPreferences(application, exercise, 'locationPreferences');
  }

  getAdditionalWorkingPreferences(application, exercise) {
    return this.getGenericPreferences(application, exercise, 'additionalWorkingPreferences');
  }

}

export { ConverterV2 };
