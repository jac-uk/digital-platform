const { getDocument, getDocuments, isEmpty, applyUpdates, getDate, formatDate } = require('../../shared/helpers');

module.exports = (config, db) => {
  return {
    flagApplicationIssues,
    flagApplicationIssuesForExercise,
    getEligibilityIssues,
    getCharacterIssues,
  };

  function getApplication(applicationId) {
    return getDocument(db.collection('applications').doc(applicationId));
  }

  function getExercise(exerciseId) {
    return getDocument(db.collection('exercises').doc(exerciseId));
  }

  /**
   * flagApplicationIssues
   * Works through an application and marks it with any issues.
   * The application document is always updated, therefore resetting previous issue data.
   * @param {*} applicationId
   *
   * Note: this behaves differently to `flagApplicationIssuesForExercise` which does not reset previous issue data
   */
  async function flagApplicationIssues(applicationId) {
    // get application
    const application = await getApplication(applicationId);
    if (application.status !== 'applied') {
      return false;
    }

    // get exercise
    const exercise = await getExercise(application.exerciseId);

    // check for eligibility issues and update document
    const eligibilityIssues = getEligibilityIssues(exercise, application);
    const characterIssues = getCharacterIssues(application);
    const data = {};
    data['processing.flags.eligibilityIssues'] = eligibilityIssues && eligibilityIssues.length > 0;
    data['processing.eligibilityIssues'] = eligibilityIssues;
    data['processing.flags.characterIssues'] = characterIssues && characterIssues.length > 0;
    data['processing.characterIssues'] = characterIssues;
    if (!isEmpty(data)) {
      await application.ref.update(data);
      return true;
    }
    return false;
  }

  /**
   * flagApplicationIssuesForExercise
   * Iterates through all applications for an exercise flagging any that have issues
   * @param {*} exerciseId
   */
  async function flagApplicationIssuesForExercise(exerciseId) {

    // get exercise data
    const exercise = await getExercise(exerciseId);
    if (!exercise) {
      return false;
    }

    // get submitted applications
    const applications = await getDocuments(db.collection('applications')
      .where('exerciseId', '==', exerciseId)
      .where('status', '==', 'applied')
    );

    // construct commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const eligibilityIssues = getEligibilityIssues(exercise, applications[i]);
      const characterIssues = getCharacterIssues(applications[i]);

      const data = {};
      if (eligibilityIssues && eligibilityIssues.length > 0) {
        data['flags.eligibilityIssues'] = true;
        data['issues.eligibilityIssues'] = eligibilityIssues;
      } else {
        data['flags.eligibilityIssues'] = false;
        data['issues.eligibilityIssues'] = [];
      }
      if (characterIssues && characterIssues.length > 0) {
        data['flags.characterIssues'] = true;
        data['issues.characterIssues'] = characterIssues;
      } else {
        data['flags.characterIssues'] = false;
        data['issues.characterIssues'] = [];
      }

      if (!isEmpty(data)) {
        commands.push({
          command: 'update',
          ref: db.collection('applicationRecords').doc(`${applications[i].id}`),
          data: data,
        });
      }
    }

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? commands.length : false;
  }

  function getEligibilityIssues(exercise, application) {

    const issues = [];

    // citizenship
    if (application.personalDetails && application.personalDetails.citizenship) {
      if (['uk', 'republic-of-ireland', 'another-commonwealth-country'].indexOf(application.personalDetails.citizenship) < 0) {
        issues.push(newIssue('citizenship', 'Not a UK, RoI or Commonwealth citizen'));
      }
    } else {
      issues.push(newIssue('citizenship', 'No citizenship information'));
    }

    // reasonable length of service - calculated from dob, characterAndSCCDate, reasonable length of service and retirement age
    if (application.personalDetails && application.personalDetails.dateOfBirth) {
      const reasonableLengthOfService = parseInt(exercise.reasonableLengthService === 'other' ? exercise.otherLOS : exercise.reasonableLengthService);
      const retirementAge = parseInt(exercise.retirementAge === 'other' ? exercise.otherRetirement : exercise.retirementAge);
      const expectedStartDate = getDate(exercise.characterAndSCCDate);
      const expectedEndDate = new Date(expectedStartDate.getFullYear() + reasonableLengthOfService, expectedStartDate.getMonth(), expectedStartDate.getDate());
      const dateOfBirth = getDate(application.personalDetails.dateOfBirth);
      const dateOfRetirement = new Date(dateOfBirth.getFullYear() + retirementAge, dateOfBirth.getMonth(), dateOfBirth.getDate());
      const age = new Duration(dateOfBirth, expectedEndDate).toString();
      if (application.canGiveReasonableLOS === false) {
        issues.push(newIssue('rls', `Self-declared. Candidate will be ${age} old at end of service. DOB: ${formatDate(dateOfBirth)}. Candidate comments: ${application.cantGiveReasonableLOSDetails}`));
      } else {
        if (expectedEndDate > dateOfRetirement) {
          issues.push(newIssue('rls', `Candidate will be ${age} old at end of service. DOB: ${formatDate(dateOfBirth)}`));
        }
      }
    } else {
      issues.push(newIssue('rls', 'No date of birth provided'));
    }

    // post qualification experience
    if (['legal', 'leadership'].indexOf(exercise.typeOfExercise) >= 0) {
      const minimumYearsExperience = exercise.postQualificationExperience === 'other' ? exercise.otherYears : exercise.postQualificationExperience;

      if (application.qualifications && application.qualifications.length) {
        application.qualifications = application.qualifications.filter((el) => el.date);
        if (application.qualifications.length) {
          if (application.qualifications.length > 1) {
            application.qualifications.sort((a, b) => (getDate(a.date) >= getDate(b.date)) ? 1 : -1);
          }
          const firstQualificationDate = getDate(application.qualifications[0].date);
          if (application.experience && application.experience.length) {
            let experienceSinceFirstQualification = application.experience;
            if (application.employmentGaps && application.employmentGaps.length) {
              experienceSinceFirstQualification = experienceSinceFirstQualification.concat(application.employmentGaps);
            }
            experienceSinceFirstQualification = experienceSinceFirstQualification.filter((el) => {
              if (el.startDate) {
                if (el.endDate) {
                  return getDate(el.endDate) >= firstQualificationDate;
                } else {
                  return true; // no end date, so current position
                }
              }
              return false;
            });
            experienceSinceFirstQualification.sort((a, b) => (getDate(a.startDate) >= getDate(b.startDate)) ? 1 : -1);
            const relevantExperience = new Duration();
            const otherExperience = new Duration();
            let latestValidEndDate = firstQualificationDate;
            for (let i = 0, len = experienceSinceFirstQualification.length; i < len; ++i) {
              // @TODO look for any un-explained gaps > 1 year
              const el = experienceSinceFirstQualification[i];
              const startDate = getDate(el.startDate) < latestValidEndDate ? latestValidEndDate : getDate(el.startDate);
              const endDate = el.endDate ? getDate(el.endDate) : getDate(exercise.characterAndSCCDate);
              if (el.tasks && el.tasks.length > 0) {
                if (el.tasks.indexOf('other') >= 0) {
                  otherExperience.add(new Duration(startDate, endDate));
                } else {
                  if (latestValidEndDate < endDate) {
                    relevantExperience.add(new Duration(startDate, endDate));
                    latestValidEndDate = endDate;
                  }
                }
              }
            }
            if (relevantExperience.years < minimumYearsExperience) {
              if (relevantExperience.hasValue()) {
                if (otherExperience.hasValue()) {
                  issues.push(newIssue('pqe', `Candidate has ${relevantExperience.toString()} of relevant experience and ${otherExperience.toString()} to be checked`));
                } else {
                  issues.push(newIssue('pqe', `Candidate has ${relevantExperience.toString()} of relevant experience`));
                }
              } else {
                issues.push(newIssue('pqe', 'Candidate has no relevant experience'));
              }
            }
          } else {
            issues.push(newIssue('pqe', 'No experience provided'));
          }
        } else {
          issues.push(newIssue('pqe', 'No qualifications provided'));
        }
      } else {
        issues.push(newIssue('pqe', 'No qualifications provided'));
      }
    }

    return issues;
  }

  function getCharacterIssues(application) {

    let questions;
    let answers;

    if (application.characterInformationV2) {
      questions = config.APPLICATION.CHARACTER_ISSUES_V2;
      answers = application.characterInformationV2;
    } else if (application.characterInformation) {
      questions = config.APPLICATION.CHARACTER_ISSUES;
      answers = application.characterInformation;
    }

    const issues = [];

    if (questions) {
      Object.keys(questions).forEach(key => {
        if (answers[key]) {
          const summary = questions[key].summary;
          if (answers[questions[key].details]) {
            if (Array.isArray(answers[questions[key].details])) { // if the answer contains more than one issue, create an issue for each
              issues.push(newIssue(key, summary, answers[questions[key].details]));
            } else {
              const ans = answers[questions[key].details]; // else just create one issue for the answer
              issues.push(newIssue(key, summary, [ans]));
            }
          } else { // answer has no details
            issues.push(newIssue(key, summary));
          }
        }
      });
    } else {
      issues.push(newIssue('character', 'No character information'));
    }

    return issues;
  }

};

class Duration {
  constructor(startDate, endDate) {
    this.years = 0;
    this.months = 0;
    this.days = 0;
    if (startDate && endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
      this.years = endDate.getFullYear() - startDate.getFullYear();
      this.months = endDate.getMonth() - startDate.getMonth();
      this.days = endDate.getDate() - startDate.getDate();
      if (this.days < 0) {
        const daysInPreviousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        this.months -= 1;
        this.days = daysInPreviousMonth - startDate.getDate() + endDate.getDate();
      }
      if (this.months < 0) {
        this.years = this.years - 1;
        this.months = 12 - startDate.getMonth() + endDate.getMonth();
      }
    }
  }
  add(duration) {
    const daysInAMonth = 31;
    this.years += duration.years;
    this.months += duration.months;
    this.days += duration.days;
    if (this.days > daysInAMonth) {
      this.months += Math.floor(this.days / daysInAMonth);
      this.days = this.days % daysInAMonth;
    }
    if (this.months > 12) {
      this.years += Math.floor(this.months / 12);
      this.months = this.months % 12;
    }
  }
  hasValue() {
    return (this.years || this.months || this.days);
  }
  toString() {
    let parts = [];
    if (this.years) {
      if (this.years > 1) {
        parts.push(`${this.years} years`);
      } else {
        parts.push(`${this.years} year`);
      }
    }
    if (this.months) {
      if (this.months > 1) {
        parts.push(`${this.months} months`);
      } else {
        parts.push(`${this.months} month`);
      }
    }
    if (this.days) {
      if (this.days > 1) {
        parts.push(`${this.days} days`);
      } else {
        parts.push(`${this.days} day`);
      }
    }
    let text = '';
    switch (parts.length) {
      case 3:
        text = parts[0] + ', ' + parts[1] + ' and ' + parts[2];
        break;
      case 2:
        text = parts[0] + ' and ' + parts[1];
        break;
      case 1:
        text = parts[0];
        break;
    }
    return text;
  }
}

const newIssue = (type, summary, events) => {
  return {
    type: type,
    summary: summary ? summary : '',
    events: events ? events : '',
    result: '',
    comments: '',
  };
};
