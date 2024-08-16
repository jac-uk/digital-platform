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

  describe('exercise', () => {
    
    describe('type of exercise', () => {

      describe('legal', () => {
        beforeEach(()=>{
          mockExercise = {
            _applicationVersion: 2,
            typeOfExercise: 'legal',
          };
          mockApplication = {
            experience: [
              {
                jobTitle: 'Developer',
                orgBusinessName: 'JAC',
                startDate: new Date(2020, 3, 20),
                endDate: new Date(2121, 3, 20),
                tasks: ['one', 'two'],
                otherTasks: 'other task',
              },
            ],
            qualifications: [
              {
                type: 'professional',
                location: 'london',
                date: new Date(1995, 1, 20),
              },
            ],
            employmentGaps: [
              {
                startDate: new Date(1995, 1, 20),
                endDate: new Date(1995, 1, 20),
                details: 'Employment gap data',
              },
            ],
          };
        });
        it('shows qualifications', () => {
          // set up
          htmlNode = document.createElement('div');
          htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
          
          // subjects
          const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
          // assertions
          expect(qualificationsHeading.innerHTML).toBe('Qualifications');
          // table
        });
        it('shows employment gaps', () => {
          // set up
          htmlNode = document.createElement('div');
          htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
          
          // subjects
          const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');
          const employmentGapsTable = htmlNode.querySelectorAll('table')[2];

          // assertions
          expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
          expect(employmentGapsTable.innerHTML).toContain(mockApplication.employmentGaps[0].details);
        });
        it('shows post qualification experience', () => {
          // set up
          htmlNode = document.createElement('div');
          htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
          
          // subjects
          const pqeHeading = htmlNode.querySelector('#Post-qualification_experience_heading');
          const pqeTable = htmlNode.querySelector('table');

          // assertions
          expect(pqeHeading.innerHTML).toBe('Post-qualification experience');
          expect(pqeTable.innerHTML).toContain(mockApplication.qualifications[0].location);
        });

        describe('and previousJudicialExperienceApply', () => {
          it('feePaidOrSalariedJudge false', () => {
            mockApplication = {
              qualifications: [
                {
                  type: 'professional',
                  location: 'london',
                  date: new Date(1995, 1, 20),
                },
              ],
              employmentGaps: [
                {
                  startDate: new Date(1995, 1, 20),
                  endDate: new Date(1995, 1, 20),
                  details: 'Employment gap data',
                },
              ],
              experience: [
                {
                  jobTitle: 'Developer',
                  orgBusinessName: 'JAC',
                  startDate: new Date(2020, 3, 20),
                  endDate: new Date(2121, 3, 20),
                  tasks: ['one', 'two'],
                  otherTasks: 'other task',
                },
              ],
              feePaidOrSalariedJudge: false,
            };
            mockExercise = {
              _applicationVersion: 2,
              typeOfExercise: 'legal',
              previousJudicialExperienceApply: true,
            };
            // set up
            htmlNode = document.createElement('div');
            htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
            
            // subjects
            const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
            const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');
            const pqeHeading = htmlNode.querySelector('#Post-qualification_experience_heading');

            // assertions
            expect(qualificationsHeading.innerHTML).toBe('Qualifications');
            expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
            expect(pqeHeading.innerHTML).toBe('Post-qualification experience');
          });
          describe('feePaidOrSalariedJudge', () => {
            it('true', () => {
              mockApplication = {
                qualifications: [
                  {
                    type: 'professional',
                    location: 'london',
                    date: new Date(1995, 1, 20),
                  },
                ],
                employmentGaps: [
                  {
                    startDate: new Date(1995, 1, 20),
                    endDate: new Date(1995, 1, 20),
                    details: 'Employment gap data',
                  },
                ],
                experience: [
                  {
                    jobTitle: 'Developer',
                    orgBusinessName: 'JAC',
                    startDate: new Date(2020, 3, 20),
                    endDate: new Date(2121, 3, 20),
                    tasks: ['one', 'two'],
                    otherTasks: 'other task',
                  },
                ],
                feePaidOrSalariedJudge: true,
              };
              mockExercise = {
                _applicationVersion: 2,
                typeOfExercise: 'legal',
                previousJudicialExperienceApply: true,
              };
              // set up
              htmlNode = document.createElement('div');
              htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
              
              // subjects
              const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
              const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');
              const pqeHeading = htmlNode.querySelector('#Post-qualification_experience_heading');
              const judicialExperienceHeading = htmlNode.querySelector('#Judicial_experience_heading');

              // assertions
              expect(qualificationsHeading.innerHTML).toBe('Qualifications');
              expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
              expect(pqeHeading.innerHTML).toBe('Post-qualification experience');
              expect(judicialExperienceHeading.innerHTML).toBe('Judicial experience');
            });
            it('true and pjeDays = 100', () => {
              mockApplication = {
                qualifications: [
                  {
                    type: 'professional',
                    location: 'london',
                    date: new Date(1995, 1, 20),
                  },
                ],
                employmentGaps: [
                  {
                    startDate: new Date(1995, 1, 20),
                    endDate: new Date(1995, 1, 20),
                    details: 'Employment gap data',
                  },
                ],
                experience: [
                  {
                    jobTitle: 'Developer',
                    orgBusinessName: 'JAC',
                    startDate: new Date(2020, 3, 20),
                    endDate: new Date(2121, 3, 20),
                    tasks: ['one', 'two'],
                    otherTasks: 'other task',
                  },
                ],
                feePaidOrSalariedJudge: true,
                feePaidOrSalariedSatForThirtyDays: true,
              };
              mockExercise = {
                _applicationVersion: 2,
                typeOfExercise: 'legal',
                previousJudicialExperienceApply: true,
                pjeDays: 100,
              };
              // set up
              htmlNode = document.createElement('div');
              htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
              
              // subjects
              const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
              const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');
              const pqeHeading = htmlNode.querySelector('#Post-qualification_experience_heading');

              // assertions
              expect(qualificationsHeading.innerHTML).toBe('Qualifications');
              expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
              expect(pqeHeading.innerHTML).toBe('Post-qualification experience');
              expect(htmlNode.innerHTML).toContain(`${mockExercise.pjeDays} days`);
            });
            it('true and pjeDays and sat for days w/ details', () => {
              mockApplication = {
                qualifications: [
                  {
                    type: 'professional',
                    location: 'london',
                    date: new Date(1995, 1, 20),
                  },
                ],
                employmentGaps: [
                  {
                    startDate: new Date(1995, 1, 20),
                    endDate: new Date(1995, 1, 20),
                    details: 'Employment gap data',
                  },
                ],
                experience: [
                  {
                    jobTitle: 'Developer',
                    orgBusinessName: 'JAC',
                    startDate: new Date(2020, 3, 20),
                    endDate: new Date(2121, 3, 20),
                    tasks: ['one', 'two'],
                    otherTasks: 'other task',
                  },
                ],
                feePaidOrSalariedJudge: true,
                feePaidOrSalariedSatForThirtyDays: true,
                feePaidOrSalariedSittingDaysDetails: 'fee paid details',
              };
              mockExercise = {
                _applicationVersion: 2,
                typeOfExercise: 'legal',
                previousJudicialExperienceApply: true,
                pjeDays: 100,
              };
              // set up
              htmlNode = document.createElement('div');
              htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
              
              // subjects
              const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
              const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');
              const pqeHeading = htmlNode.querySelector('#Post-qualification_experience_heading');

              // assertions
              expect(qualificationsHeading.innerHTML).toBe('Qualifications');
              expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
              expect(pqeHeading.innerHTML).toBe('Post-qualification experience');
              expect(htmlNode.innerHTML).toContain(`<th>Sat for at least ${mockExercise.pjeDays} days</th><td>Yes</td>`);
              expect(htmlNode.innerHTML).toContain(`<th>Details</th><td>${mockApplication.feePaidOrSalariedSittingDaysDetails}</td>`);
            });
          });
        });
      });
      it('leadership', () => {
        mockApplication = {
          qualifications: [
            {
              type: 'professional',
              location: 'london',
              date: new Date(1995, 1, 20),
            },
          ],
          employmentGaps: [
            {
              startDate: new Date(1995, 1, 20),
              endDate: new Date(1995, 1, 20),
              details: 'Employment gap data',
            },
          ],
        };
        mockExercise = {
          _applicationVersion: 2,
          typeOfExercise: 'leadership',
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        const qualificationsHeading = htmlNode.querySelector('#Qualifications_heading');
        const employmentGapsHeading = htmlNode.querySelector('#Employment_gaps_heading');

        // assertions
        expect(qualificationsHeading.innerHTML).toBe('Qualifications');
        expect(employmentGapsHeading.innerHTML).toBe('Employment gaps');
      });
      it('non-legal', () => {
        mockApplication = {
          experience: [
            {
              jobTitle: 'Developer',
              orgBusinessName: 'JAC',
              startDate: new Date(2020, 3, 20),
              endDate: new Date(2121, 3, 20),
              tasks: ['one', 'two'],
              otherTasks: 'other task',
            },
          ],
        };
        mockExercise = {
          typeOfExercise: 'non-legal',
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const experienceHeading = htmlNode.querySelector('#Experience_heading');

        // assertions
        expect(experienceHeading.innerHTML).toBe('Experience');
      });

    });

    describe('welsh requirement', () => {
      it('true', () => {
        mockExercise.welshRequirement = true;
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const welshPostHeading = htmlNode.querySelector('#Welsh_posts_heading');

        // assertions
        expect(welshPostHeading.innerHTML).toBe('Welsh posts');
      });

      it('false', () => {
        mockExercise.welshRequirement = false;
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const welshPostHeading = htmlNode.querySelector('#Welsh_posts_heading');

        // assertions
        expect(welshPostHeading).toBe(null);
      });
    });

    describe('additional working preferences', () => {
      it('single choice', () => {
        mockExercise = {
          additionalWorkingPreferences: [
            {
              questionType: 'single-choice',
              question: 'Single choice question?',
              options: [
                'Single choice answer',
                'Single choice wrong option',
                'Single choice option',
              ],
            },
          ],        
        };
        mockApplication = {
          additionalWorkingPreferences: [
            {
              selection: 'single choice answer',
            },    
          ],    
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const additionalPreferencesHeading = htmlNode.querySelector('#Additional_Preferences_heading');
        const additionalPreferencesTable = htmlNode.querySelector('table');

        // assertions
        expect(additionalPreferencesHeading.innerHTML).toBe('Additional Preferences');
        expect(additionalPreferencesTable.innerHTML).toContain(mockExercise.additionalWorkingPreferences[0].question);
        expect(additionalPreferencesTable.innerHTML).toContain(mockApplication.additionalWorkingPreferences[0].selection);
      });

      it('multiple choice', () => {
        mockExercise = {
          additionalWorkingPreferences: [
            {
              questionType: 'multiple-choice',
              question: 'multiple choice question?',
              options: [
                'multiple choice answer',
                'multiple choice wrong option',
                'multiple choice option',
              ],
            },
          ],        
        };
        mockApplication = {
          additionalWorkingPreferences: [
            {
              selection: [
                'multiple choice answer',
                'multiple choice option',
              ],
            },
          ],    
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const additionalPreferencesHeading = htmlNode.querySelector('#Additional_Preferences_heading');
        const additionalPreferencesTable = htmlNode.querySelector('table');

        // assertions
        expect(additionalPreferencesHeading.innerHTML).toBe('Additional Preferences');
        expect(additionalPreferencesTable.innerHTML).toContain(mockExercise.additionalWorkingPreferences[0].question);
        expect(additionalPreferencesTable.innerHTML).toContain(mockApplication.additionalWorkingPreferences[0].selection[0]);
        expect(additionalPreferencesTable.innerHTML).toContain(mockApplication.additionalWorkingPreferences[0].selection[1]);
      });

      it('ranked choice', () => {
        // order not tested
        mockExercise = {
          additionalWorkingPreferences: [
            {
              questionType: 'ranked-choice',
              question: 'ranked choice question?',
              options: [
                'ranked choice 1',
                'ranked choice 2',
                'ranked choice 3',
              ],
            },
          ],        
        };
        mockApplication = {
          additionalWorkingPreferences: [
            {
              selection: [
                'ranked choice 3',
                'ranked choice 2',
                'ranked choice 1',
              ],
            },
          ],    
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const additionalPreferencesHeading = htmlNode.querySelector('#Additional_Preferences_heading');
        const additionalPreferencesTable = htmlNode.querySelector('table');

        // assertions
        expect(additionalPreferencesHeading.innerHTML).toBe('Additional Preferences');
        expect(additionalPreferencesTable.innerHTML).toContain(mockExercise.additionalWorkingPreferences[0].question);
        expect(additionalPreferencesTable.innerHTML).toContain(mockApplication.additionalWorkingPreferences[0].selection[0]);
        expect(additionalPreferencesTable.innerHTML).toContain(mockApplication.additionalWorkingPreferences[0].selection[1]);
      });

    });

    describe('memberships', () => {
      it('chartered institute of building', () => {
        mockExercise = {
          memberships: [
            'chartered-institute-of-building',
          ],
        };
        mockApplication = {
          charteredAssociationBuildingEngineersDate: new Date(1995, 1, 1995),
          charteredAssociationBuildingEngineersNumber: '1234',
          charteredAssociationBuildingEngineersInformation: '5678',
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const membershipsHeading = htmlNode.querySelector('#Memberships_heading');
        const membershipsTable = htmlNode.querySelector('table');

        // assertions
        expect(membershipsHeading.innerHTML).toBe('Memberships');
        expect(membershipsTable.innerHTML).toContain('Chartered Association of Building Engineers');
        expect(membershipsTable.innerHTML).toContain(mockApplication.charteredAssociationBuildingEngineersNumber);
        expect(membershipsTable.innerHTML).toContain(mockApplication.charteredAssociationBuildingEngineersInformation);
        // test for date
      });
      // [
      //   'chartered-institute-of-environmental-health',
      //   'royal-institution-of-chartered-surveyors',
      //   'royal-institute-of-british-architects',
      //   'chartered-association-of-building-engineers',
      //   'other',
      //   'general-medical-council',
      //   'royal-college-of-psychiatrists',
      // ];
    });

  });

  describe('application', () => {

    describe('Jurisdiction Question', () => {
      it('string', () => {
        // mockExercise = {
          // @note@ issue - exercise jurisdiction details not needed
        // };
        mockApplication = {
          jurisdictionPreferences: 'jurisdiction A',
        };

        mockExercise = {
          jurisdictionQuestion: 'Test question A',
        };

        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const jurisdictionHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
        const jurisdictionTable = htmlNode.querySelector('table');

        // assertions
        expect(jurisdictionHeading.innerHTML).toBe('Jurisdiction Preferences');
        expect(jurisdictionTable.innerHTML).toContain(mockApplication.jurisdictionPreferences);
        // test for date
      });
      it('array', () => {
        // mockExercise = {
        // };
        mockApplication = {
          jurisdictionPreferences: [
            'jurisdiction A',
            'jurisdiction B',
            'jurisdiction C',
          ],
        };
        // set up
        htmlNode = document.createElement('div');
        htmlNode.innerHTML = converter.getHtmlPanelPack(mockApplication, mockExercise);
        
        // subjects
        const jurisdictionHeading = htmlNode.querySelector('#Jurisdiction_Preferences_heading');
        const jurisdictionTable = htmlNode.querySelector('table');

        // assertions
        expect(jurisdictionHeading.innerHTML).toBe('Jurisdiction Preferences');
        expect(jurisdictionTable.innerHTML).toContain(mockApplication.jurisdictionPreferences[0]);
        expect(jurisdictionTable.innerHTML).toContain(mockApplication.jurisdictionPreferences[1]);
        expect(jurisdictionTable.innerHTML).toContain(mockApplication.jurisdictionPreferences[2]);
        // test for date
      });
    });

  });

  describe('getSelectionCriteria', () => {
    
    // const mockAddField = jest.fn();

    it('returns empty array when supplied no data', () => {
      mockApplication = { selectionCriteriaAnswers: [] };
      mockExercise = { selectionCriteria: [] };
      // converter.getAdditionalSelectionCriteria(mockApplication, mockExercise);
      expect(converter.getAdditionalSelectionCriteria(mockApplication, mockExercise)).toEqual([]);
    });

    it('returns formatted data when supplied objects', () => {
      mockApplication = { selectionCriteriaAnswers: [ { answerDetails: 'title1' }, { answerDetails: 'title2' }, { answerDetails: 'title3' } ] };
      mockExercise = { selectionCriteria: [ { title: 'Sc1' }, { title: 'sc2' }, { title: 'SC3' } ] };
      // converter.getAdditionalSelectionCriteria(mockApplication, mockExercise);
      expect(converter.getAdditionalSelectionCriteria(mockApplication, mockExercise)).toEqual([
          {
            label: 'Sc1',
            'lineBreak': false,
            'value': 'title1',
            'dataOnSeparateRow': true,
          },
          {
            label: 'sc2',
            'lineBreak': false,
            'value': 'title2',
            'dataOnSeparateRow': true,
          },
          {
            label: 'SC3',
            'lineBreak': false,
            'value': 'title3',
            'dataOnSeparateRow': true,
          },
        ]);
    });

  });

  describe('getExperienceData', () => {
    it('returns empty array when supplied no data', () => {
      mockApplication = {};
      expect(converter.getExperienceData(mockApplication)).toEqual([]);
      mockApplication = { experience: {} };
      expect(converter.getExperienceData(mockApplication)).toEqual([]);
      mockApplication = { experience: [] };
      expect(converter.getExperienceData(mockApplication)).toEqual([]);
      mockApplication = { experience: null };
      expect(converter.getExperienceData(mockApplication)).toEqual([]);
      mockApplication = { experience: undefined };
      expect(converter.getExperienceData(mockApplication)).toEqual([]);
    });

    it('returns formatted data when supplied objects', () => {
      mockApplication = {
        experience: [
          { 
            orgBusinessName: 'name',
            jobTitle: 'title',
            startDate: new Date(2022, 7, 1),
            endDate: new Date(2022, 7, 2),
          }, 
        ],
      };
      expect(converter.getExperienceData(mockApplication)).toEqual([
        {
          label: 'Organisation or business',
          lineBreak: false,
          value: 'name',
          dataOnSeparateRow: false,
        },
        {
          label: 'Job title',
          lineBreak: false,
          value: 'title',
          dataOnSeparateRow: false,
        },
        {
          label: 'Date qualified',
          lineBreak: false,
          value: '01/08/2022 - 02/08/2022',
          dataOnSeparateRow: false,
        },
      ]);
    });

  });
});

// const mockParams = {
//   showNames: true,
// };

// let mockApplication = {
  // referenceNumber: '001',
  // personalDetails: {
  //   fullName: 'Test Candidate',
  // },
  // additionalWorkingPreferences: [
  //   'working preference',
  // ],
  // selectionCriteriaAnswers: [
  //   'criteria answers',
  // ],
  // jurisdictionPreferences: [
  //   'jurisdiction prefs',
  // ],
  // qualifications: [
  //   {
  //     type: 'professional',
  //     location: 'london',
  //     date: new Date(1995, 1, 20),
  //   },
  // ],
  // experience: [
  //   {
  //     type: 'professional',
  //     location: 'london',
  //     date: new Date(1995, 1, 20),
  //   },
  // ],
  // employmentGaps: [
  //   {
  //     startDate: new Date(1995, 1, 20),
  //     endDate: new Date(1995, 1, 20),
  //     details: 'unemp',
  //   },
  // ],
  
  // charteredAssociationBuildingEngineersDate: '',
  // charteredAssociationBuildingEngineersNumber: '',
  // charteredAssociationBuildingEngineersInformation: '',
  // // 
  // charteredInstituteBuildingDate: '',
  // charteredInstituteBuildingNumber: '',
  // charteredInstituteBuildingInformation: '',
  // // 
  // charteredInstituteEnvironmentalHealthDate: '',
  // charteredInstituteEnvironmentalHealthNumber: '',
  // charteredInstituteEnvironmentalHealthInformation: '',
  // // 
  // royalCollegeOfPsychiatristsDate: '',
  // royalCollegeOfPsychiatristsNumber: '',
  // royalCollegeOfPsychiatristsInformation: '',
  // // 
  // royalInstitutionCharteredSurveyorsDate: new Date('1995').toLocaleDateString(),
  // royalInstitutionCharteredSurveyorsNumber: '',
  // royalInstitutionCharteredSurveyorsInformation: '',
  // // 
  // royalInstituteBritishArchitectsDate: '',
  // royalInstituteBritishArchitectsNumber: '',
  // royalInstituteBritishArchitectsInformation: '',
  // // 
  // otherProfessionalMemberships: '',
  // otherProfessionalMembershipsDate: '',
  // otherProfessionalMembershipsNumber: '',
  // otherProfessionalMembershipsInformation: '',
  // // 
  // generalMedicalCouncilDate: '',
  // generalMedicalCouncilNumber: '',
  // generalMedicalCouncilInformation: '',
  // generalMedicalCouncilConditional: '',
  // generalMedicalCouncilConditionalDetails: '',
  // generalMedicalCouncilConditionalStartDate: '',
  // generalMedicalCouncilConditionalEndDate: '',
  // // 
  // partTimeWorkingPreferencesDetails: '',
  // // 
  // locationPreferences: [

  // ],
  // 
  // firstAssessorFullName: '',
  // firstAssessorEmail: '',
  // firstAssessorPhone: '',
  // firstAssessorTitle: '',
  // secondAssessorFullName: '',
  // secondAssessorEmail: '',
  // secondAssessorPhone: '',
  // secondAssessorTitle: '',

  // canReadAndWriteWelsh: false,
  // canSpeakWelsh: true, // false
  // applyingUnderSchedule2d: true, // false
  // experienceUnderSchedule2D: 'experience under 2d',
  // 
  // applyingUnderSchedule2Three: false, // true
  // experienceUnderSchedule2Three: 'experience under 2(3)',
  // 
  // feePaidOrSalariedJudge: true, // false
  // feePaidOrSalariedSittingDaysDetails: 'details',
  // feePaidOrSalariedSatForThirtyDays: false, //true
  // declaredAppointmentInQuasiJudicialBody: true, //false
  // quasiJudicialSittingDaysDetails: 'details',
  // pjeDays: 100,
  // skillsAquisitionDetails: 'details',
// };

// let mockExercise = {
  // welshRequirement: false,
  // typeOfExercise: 'blank', // 'legal' 'badString' 'non-legal' 'leadership'
  // additionalWorkingPreferences: [
  //   'working preference',
  // ],
  // memberships: [
    // 'membership',
  // ],
  // jurisdictionQuestion: 'Jurisdiction',
  // schedule2Apply: '',
  // appliedSchedule: 'schedule-2-3', // 'schedule-2-d' 'schedule-2-3' 'schedule-2-3' 'schedule-2-d'
  // yesSalaryDetails: 'details', 
  // locationQuestionType: '',
  // locationQuestion: ''
// };
