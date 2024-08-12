/**
 * @jest-environment jsdom
 */
/* eslint-env browser */

import initConverter from '../../functions/shared/converters/applicationConverter.js';

const converter = initConverter();

describe('applicationConverter', () => {
  let htmlNode;
  let mockExercise;
  let mockApplication;
  let mockParams;
  
  describe('given only', () => {
    it('empty objects', () => {
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
      
      // subjects
      const title = htmlNode.querySelectorAll('#title');

      // assertions
      expect(title[1].innerHTML).toBe('Error - Missing Exercise information');
      expect(title[0].innerHTML).toBe('Error - Missing Application information');
    });

    it('typeOfExercise = badString', () => {
      mockExercise = { 
        typeOfExercise: 'badString',
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
      
      // subjects
      const title = htmlNode.querySelector('#title');

      // assertions
      expect(title.innerHTML).toBe('Error - Missing Application information');   
    });

    it('Application with ref number', () => {
      // set up
      mockApplication = {
        referenceNumber: '001',
      };
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication);
      
      // subjects
      const title = htmlNode.querySelectorAll('#title');

      // assertions
      expect(title[0].innerHTML).toBe('001');
      expect(title[1].innerHTML).toBe('Error - Missing Exercise information');
    });
      
    it('Application with ref number + names and show names param', () => {
      // set up
      mockApplication = {
        referenceNumber: '001',
        personalDetails: {
          fullName: 'Test Candidate',
        },
      };
      mockParams = {
        showNames: true,
      };
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise, mockParams);
      
      // subjects
      const title = htmlNode.querySelectorAll('#title');

      // assertions
      expect(title[0].innerHTML).toBe('Test Candidate 001');
    });
  });

  /**
   * Applies to both location preferences and additional preferences
   */
  describe('Generic Preferences', () => {
    it('Single Choice', () => {
      mockExercise = {
        locationPreferences: [
          {
            groupAnswers: false,
            id: 'mhs',
            question: 'Single-choice question',
            questionType: 'single-choice',
            answers: [
              {
                answer: 'answer 1',
                id: 'rbl',
              },
              {
                answer: 'answer 2',
                id: 'dln',
              },
              {
                answer: 'answer 3',
                id: 'hdk',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          mhs: 'dln',
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
      
      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');
      const locationPreferencesTable = htmlNode.querySelector('table');

      // assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].question);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].answer);
    });

    it('Multiple Choice - Not Grouped', () => {
      mockExercise = {
        locationPreferences: [
          {
            allowLinkedQuestions: false,
            groupAnswers: false,
            id: 'nvq',
            minimumAnswerMode: 'any',
            question: 'Multiple choice, any answers',
            questionType: 'multiple-choice',
            answers: [
              {
                answer: 'answer 1',
                id: 'gsd',
              },
              {
                answer: 'answer 2',
                id: 'rqd',
              },
              {
                answer: 'answer 3',
                id: 'yez',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          nvq: [
            'rqd', 'gsd',
          ],
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');
      const locationPreferencesTable = htmlNode.querySelector('table');

      // assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].question);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[0].answer);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].answer);
    });

    it('Multiple Choice - Grouped', () => {
      mockExercise = {
        locationPreferences: [
          {
            id: 'oju',
            question: 'Multiple choice, grouped answers',
            questionType: 'multiple-choice',
            groupAnswers: true,
            minimumAnswerMode: 'any',
            answers: [
              {
                answers: [
                  {
                    answer: 'answer 1',
                    id: 'zih',
                  },
                  {
                    answer: 'answer 2',
                    id: 'ybj',
                  },
                ],
                group: 'Group 1',
                id: 'izm',
              },
              {
                answers: [
                  {
                    answer: 'answer 4',
                    id: 'ynl',
                  },
                  {
                    answer: 'answer 5',
                    id: 'nwc',
                  },
                ],
                group: 'Group 2',
                id: 'arh',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          oju: [
            'zih', 'nwc',
          ],
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
      
      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');
      const locationPreferencesTable = htmlNode.querySelector('table');

      // assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].question);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[0].answers[0].answer);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[0].group);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].answers[1].answer);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].group);
    });

    it('Ranked Choice - not allowd equal', () => {
      mockExercise = {
        locationPreferences: [
          {
            groupAnswers: false,
            id: 'idt',
            minimumAnswerMode: 'all',
            question: 'Ranked choice, all answers',
            questionRequired: true,
            questionType: 'ranked-choice',
            answers: [
              {
                answer: 'answer 1',
                id: 'nvd',
              },
              {
                answer: 'answer 2',
                id: 'qka',
              },
              {
                answer: 'answer 3',
                id: 'bpp',
              },
              {
                answer: 'answer 4',
                id: 'dds',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          idt: {
            bpp: 3,
            dds: 2,
            nvd: 1,
            qka: 4,
          },
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');
      
      // Select the list and its items
      const list = htmlNode.querySelector('ul');
      const items = Array.from(list.querySelectorAll('li'));

      // Define the expected order of items
      const expectedOrder = ['1: answer 1', '2: answer 4', '3: answer 3', '4: answer 2'];

      // Extract the text content of the items
      const actualOrder = items.map(item => item.textContent.trim());

      // Assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(actualOrder).toEqual(expectedOrder);   // compare the order
    });

    it('Ranked Choice - Allow equal', () => {
      mockExercise = {
        locationPreferences: [
          {
            allowEqualRanking: true,
            allowLinkedQuestions: false,
            groupAnswers: false,
            id: 'zrp',
            minimumAnswerMode: 'all',
            question: 'Ranked choice, all answers, allow equal rank',
            questionRequired: true,
            questionType: 'ranked-choice',


            answers: [
              {
                answer: 'answer 1',
                id: 'guv',
              },
              {
                answer: 'answer 2',
                id: 'grg',
              },
              {
                answer: 'answer 3',
                id: 'jni',
              },
              {
                answer: 'answer 4',
                id: 'ynt',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          zrp: {
            grg: 2,
            guv: 1,
            jni: 3,
            ynt: 3,
          },
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');

      // assertions
      
      // Select the list and its items
      const list = htmlNode.querySelector('ul');
      const items = Array.from(list.querySelectorAll('li'));

      // Define the expected order of items
      const expectedOrder = ['1: answer 1', '2: answer 2', '3: answer 3, answer 4'];

      // Extract the text content of the items
      const actualOrder = items.map(item => item.textContent.trim());

      // Assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(actualOrder).toEqual(expectedOrder);   // compare the order
    });

    it('Ranked Choice - Grouped', () => {
      mockExercise = {
        locationPreferences: [
          {
            groupAnswers: true,
            id: 'cqr',
            minimumAnswerMode: 'any',
            question: 'Ranked choice, grouped answers',
            questionRequired: true,
            questionType: 'ranked-choice',
            answers: [
              {
                answers: [
                  {
                    answer: 'answer 1',
                    id: 'web',
                  },
                  {
                    answer: 'answer 2',
                    id: 'mty',
                  },
                ],
                group: 'Group 1',
                id: 'yqb',
              },
              {
                answers: [
                  {
                    answer: 'answer 3',
                    id: 'gtc',
                  },
                  {
                    answer: 'answer 4',
                    id: 'ntd',
                  },
                  {
                    answer: 'answer 5',
                    id: 'tlc',
                  },
                ],
                group: 'Group 2',
                id: 'ufr',
              },
            ],
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        locationPreferences: {
          cqr: {
            mty: 1,
            ntd: 2,
          },
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

      // subjects
      const locationPreferencesHeading = htmlNode.querySelector('#Location_Preferences_heading');
      const locationPreferencesTable = htmlNode.querySelector('table');

      // assertions
      expect(locationPreferencesHeading.innerHTML).toBe('Location Preferences');
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].question);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[0].answers[1].answer);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[0].group);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].answers[1].answer);
      expect(locationPreferencesTable.innerHTML).toContain(mockExercise.locationPreferences[0].answers[1].group);
    });

  });


  describe('Jurisdiction Preferences', () => {
    
    it('Multiple Choice - Answer Source', () => {
      mockExercise = {
        jurisdictionPreferences: [
          {
            allowLinkedQuestions: false,
            answerSource: 'jurisdictions',
            groupAnswers: false,
            id: 'chk',
            linkedQuestion: '',
            minimumAnswerMode: 'any',
            question: 'Multiple choice using master jurisdiction list for answers',
            questionRequired: true,
            questionType: 'multiple-choice',
          },
        ],        
      };
      mockApplication = {
        referenceNumber: 'ABC123',
        jurisdictionPreferences: {
          chk: ['crime'],
        },
      };
      // set up
      htmlNode = document.createElement('div');
      htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

      // subjects
      const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
      const jurisdictionPreferencesTable = htmlNode.querySelector('table');

      // assertions
      expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
      expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
      expect(jurisdictionPreferencesTable.innerHTML).toContain(mockApplication.jurisdictionPreferences.chk[0]);
    });
  });

  it('Single Choice', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          allowLinkedQuestions: true,
          answerSource: '',
          groupAnswers: false,
          id: 'teu',
          minimumAnswerMode: 'any',
          question: 'Single choice with linked questions',
          questionRequired: true,
          questionType: 'single-choice',
          answers: [
            {
              answer: 'answer 1',
              id: 'abx',
            },
            {
              answer: 'answer 2',
              id: 'prx',
            },
          ],
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        teu: 'abx',
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].answers[0].answer);
  });

  it('Linked Answer - multiple choice', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          allowLinkedQuestions: false,
          answerSource: 'jurisdictions',
          groupAnswers: false,
          id: 'zhe',
          linkedAnswer: 'abx',
          linkedQuestion: 'teu',
          minimumAnswerMode: 'any',
          question: 'You chose answer 1, now answer this linked question, using master jurisdiction list',
          questionRequired: true,
          questionType: 'multiple-choice',
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        zhe: [
          'civil',
          'family',
        ],
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockApplication.jurisdictionPreferences.zhe[0]);
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockApplication.jurisdictionPreferences.zhe[1]);
  });

  it('Ranked choice - not grouped, using master jurisdiction list with equal ranking', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          allowEqualRanking: true,
          allowLinkedQuestions: false,
          answerSource: 'jurisdictions',
          groupAnswers: false,
          id: 'bbt',
          minimumAnswerMode: 'any',
          question: 'Ranked choice (not grouped), any answers, using master jurisdiction list for answers with Equal Ranking',
          questionRequired: true,
          questionType:'ranked-choice',
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        bbt: {
          civil: 1,
          crime: 2,
          family: 2,
        },
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // Select the list and its items
    const list = htmlNode.querySelector('ul');
    const items = Array.from(list.querySelectorAll('li'));

    // Define the expected order of items
    const expectedOrder = ['1: civil', '2: crime, family'];

    // Extract the text content of the items
    const actualOrder = items.map(item => item.textContent.trim());

    // Assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(actualOrder).toEqual(expectedOrder);   // compare the order
  });

  it('Ranked choice - not grouped using master jurisdiction list for answers with equal ranking', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          allowEqualRanking: true,
          allowLinkedQuestions: false,
          answerSource: 'jurisdictions',
          groupAnswers: false,
          id: 'imu',
          minimumAnswerMode: 'all',
          question: 'Ranked choice (not grouped), all answers, using master jurisdiction list for answers with Equal Ranking',
          questionRequired: true,
          questionType: 'ranked-choice',
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        imu: {
          civil: 1,
          crime: 2,
          family: 1,
        },
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // Select the list and its items
    const list = htmlNode.querySelector('ul');
    const items = Array.from(list.querySelectorAll('li'));

    // Define the expected order of items
    const expectedOrder = ['1: civil, family', '2: crime'];

    // Extract the text content of the items
    const actualOrder = items.map(item => item.textContent.trim());

    // Assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(actualOrder).toEqual(expectedOrder);   // compare the order
  });

  it('Ranked choice - not grouped using master jurisdiction list for answers without equal ranking', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          
          allowLinkedQuestions: false,
          answerSource: 'jurisdictions',
          groupAnswers: false,
          id: 'lbk',
          minimumAnswerMode: 'any',
          question: 'Ranked choice - not grouped using master jurisdiction list for answers without Equal Ranking',
          questionRequired: true,
          questionType: 'ranked-choice',
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        lbk: {
          civil: 1,
          crime: 3,
          family: 2,
        },
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // Select the list and its items
    const list = htmlNode.querySelector('ul');
    const items = Array.from(list.querySelectorAll('li'));

    // Define the expected order of items
    const expectedOrder = ['1: civil', '2: family', '3: crime'];

    // Extract the text content of the items
    const actualOrder = items.map(item => item.textContent.trim());

    // Assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(actualOrder).toEqual(expectedOrder);   // compare the order
  });

  it('Ranked choice - not grouped using master jurisdiction list for answers without equal ranking', () => {
    mockExercise = {
      jurisdictionPreferences: [
        {
          allowEqualRanking: true,
          allowLinkedQuestions: false,
          answerSource: '',
          groupAnswers: false,
          id: 'diu',
          minimumAnswerMode: 'any',
          question: 'Ranked choice - not grouped not using master jurisdiction list for answers with Equal Ranking',
          questionRequired: true,
          questionType: 'ranked-choice',
          answers: [
            {
              answer: 'answer 1',
              id: 'iev',
            },
            {
              answer: 'answer 2',
              id: 'adn',
            },
            {
              answer: 'answer 3',
              id: 'ftx',
            },
          ],
        },
      ],        
    };
    mockApplication = {
      referenceNumber: 'ABC123',
      jurisdictionPreferences: {
        diu: {
          adn: 1,
          ftx: 2,
        },
      },
    };
    // set up
    htmlNode = document.createElement('div');
    htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);

    // subjects
    const jurisdictionPreferencesHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
    const jurisdictionPreferencesTable = htmlNode.querySelector('table');

    // Select the list and its items
    const list = htmlNode.querySelector('ul');
    const items = Array.from(list.querySelectorAll('li'));

    // Define the expected order of items
    const expectedOrder = ['1: answer 2', '2: answer 3'];

    // Extract the text content of the items
    const actualOrder = items.map(item => item.textContent.trim());

    // Assertions
    expect(jurisdictionPreferencesHeading.innerHTML).toBe('Jurisdiction Preferences');
    expect(jurisdictionPreferencesTable.innerHTML).toContain(mockExercise.jurisdictionPreferences[0].question);
    expect(actualOrder).toEqual(expectedOrder);   // compare the order
  });

});
