import { getDocument, isEmpty, applyUpdates, getDate } from '../../shared/helpers.js';
import lookup from '../../shared/converters/lookup.js';
import _ from 'lodash';
import { APPLICATION } from '../../shared/constants.js';

export default (firebase, db) => {
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
   * Works through an application and marks it with any issues including eligibility, character issues.
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
    const applicationRecord = await getDocument(db.collection('applicationRecords').doc(applicationId));
    const eligibilityIssues = getEligibilityIssues(exercise, application, applicationRecord);
    const characterIssues = getCharacterIssues(exercise, application);
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
   * Iterates through all applications for an exercise flagging any that have issues including eligibility, character issues.
   * @param {string}  exerciseId
   * @param {boolean} reset If true, issues are repopulated even if they already exist
   */
  async function flagApplicationIssuesForExercise(exerciseId, reset = false) {
    // get exercise data
    const exercise = await getExercise(exerciseId);
    if (!exercise) {
      return false;
    }

    // batched process applications
    const batchSize = 100;
    let applicationCount = 0;
    let applications = [];
    let lastApplicationDoc = null;
    let lastApplication = null;

    /**
     * {
     *    stage1 : {
     *        status1: 1,
     *        status2: 2
     *    },
     *    stage2 : {
     *        status3: 5,
     *    },
     * }
     */
    // count application stage and status for character issue report
    const characterIssueStatusCounts = {};

    do {
      // get submitted applications
      let query = db
        .collection('applications')
        .where('exerciseId', '==', exerciseId)
        .where('status', '==', 'applied')
        .orderBy('createdAt');

      if (lastApplicationDoc) {
        query = query.startAfter(lastApplicationDoc);
      }

      query = query.limit(batchSize);

      const applicationSnapshot = await query.get();
      applications = [];
      applicationSnapshot.forEach((doc) => {
        const document = doc.data();
        document.id = doc.id;
        document.ref = doc.ref;
        applications.push(document);
      });

      // end the loop if no more applications
      if (!applications.length) {
        break;
      }

      // update cursor & total
      lastApplicationDoc = _.last(applicationSnapshot.docs);
      lastApplication = _.last(applications);
      applicationCount += applications.length;

      // process application
      const result = await updateApplicationIssues(exercise, applications, reset, characterIssueStatusCounts);

      if (!result) {
        console.log(`Fail to update Application Issues, start after application: ${lastApplication.id}`);
        return false;
      }

      console.log(`Issues of ${applications.length} applications processed, start after application: ${lastApplication.id}`);
    } while (applications.length);

    console.log(`Flag Application Issues completed, ${applicationCount} applications processed`);

    // return
    return applicationCount;
  }

  async function updateApplicationIssues(exercise, applications, reset, characterIssueStatusCounts) {

    const exerciseId = exercise.id;

    // construct commands
    const commands = [];
    for (let i = 0, len = applications.length; i < len; ++i) {
      const applicationRecord = await getDocument(db.collection('applicationRecords').doc(`${applications[i].id}`));
      const eligibilityIssues = getEligibilityIssues(exercise, applications[i], applicationRecord);
      const characterIssues = getCharacterIssues(exercise, applications[i]);

      const stage = applicationRecord ? applicationRecord.stage : '';
      const status = applicationRecord ? applicationRecord.status || 'blank' : '';

      const data = {};
      if (eligibilityIssues && eligibilityIssues.length > 0) {
        data['flags.eligibilityIssues'] = true;
        // check if all eligibility issues are met
        data['flags.eligibilityIssuesMet'] = eligibilityIssues.every(issue => ['rls', 'pq', 'pqe', 'pje'].includes(issue.type) ? issue.summary.indexOf('Met') === 0 : true);
        data['issues.eligibilityIssues'] = eligibilityIssues;
      } else {
        data['flags.eligibilityIssues'] = false;
        data['flags.eligibilityIssuesMet'] = false;
        data['issues.eligibilityIssues'] = [];
      }
      if (characterIssues && characterIssues.length > 0) {
        data['flags.characterIssues'] = true;
        if (applicationRecord && (reset || (!applicationRecord.flags || !applicationRecord.flags.characterIssues))) {
          data['issues.characterIssues'] = characterIssues;
        }

        if (stage && status) {
          if (!characterIssueStatusCounts[stage]) characterIssueStatusCounts[stage] = {};
          if (!characterIssueStatusCounts[stage][status]) characterIssueStatusCounts[stage][status] = 0;
          characterIssueStatusCounts[stage][status] += 1;
        }

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

    // count application status
    commands.push({
      command: 'update',
      ref: db.collection('exercises').doc(`${exerciseId}`),
      data: {
        '_characterIssue': {
          'statusCounts': characterIssueStatusCounts,
        },
      },
    });
    // add timestamp for character and eligibility issues reports
    commands.push(
      {
        command: 'set',
        ref: db.collection('exercises').doc(exerciseId).collection('reports').doc('characterIssues'),
        data: {
          createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        },
      },
      {
        command: 'set',
        ref: db.collection('exercises').doc(exerciseId).collection('reports').doc('eligibilityIssues'),
        data: {
          createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        },
      }
    );

    // write to db
    const result = await applyUpdates(db, commands);

    // return
    return result ? commands.length : false;
  }

  function getEligibilityIssues(exercise, application, applicationRecord) {

    const issues = [];
    const isLegalExercise = ['legal', 'leadership'].includes(exercise.typeOfExercise);
    const isNonLegalExercise = ['non-legal', 'leadership-non-legal'].includes(exercise.typeOfExercise);

    // reasonable length of service - calculated from dob, characterAndSCCDate, reasonable length of service and retirement age
    let rlsIssue = null;
    let sccAge = null;
    if (application.personalDetails && application.personalDetails.dateOfBirth) {
      const reasonableLengthOfService = parseInt(exercise.reasonableLengthService === 'other' ? exercise.otherLOS : exercise.reasonableLengthService);
      const retirementAge = parseInt(exercise.retirementAge === 'other' ? exercise.otherRetirement : exercise.retirementAge);
      const expectedStartDate = getDate(exercise.characterAndSCCDate);
      const expectedEndDate = new Date(expectedStartDate.getFullYear() + reasonableLengthOfService, expectedStartDate.getMonth(), expectedStartDate.getDate());
      const dateOfBirth = getDate(application.personalDetails.dateOfBirth);
      const dateOfRetirement = new Date(dateOfBirth.getFullYear() + retirementAge, dateOfBirth.getMonth(), dateOfBirth.getDate());
      sccAge = new Duration(dateOfBirth, getDate(exercise.characterAndSCCDate)).setDays(0).toString();

      if (application.canGiveReasonableLOS === false) {
        const rslSummary = isNonLegalExercise ? `Not Met (${application.cantGiveReasonableLOSDetails})` : 'Not Met';
        rlsIssue = newEligibilityIssue('rls', rslSummary, application.cantGiveReasonableLOSDetails);
      } else {
        if (expectedEndDate > dateOfRetirement) {
          rlsIssue = newEligibilityIssue('rls', 'Not Met');
        } else {
          rlsIssue = newEligibilityIssue('rls', 'Met');
        }
      }
    } else {
      rlsIssue = newEligibilityIssue('rls', 'Not Met (No date of birth provided)');
    }
    rlsIssue.sccAge = sccAge;
    issues.push(rlsIssue);

    if (isLegalExercise) {
      // professional qualification
      const qualificationIssue = getQualificationIssue(exercise, application);
      if (qualificationIssue) issues.push(qualificationIssue);

      const minimumYearsExperience = exercise.postQualificationExperience === 'other' ? exercise.otherYears : exercise.postQualificationExperience;

      // post qualification experience
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
              // subtract 1 month from the total calculated
              startDate.setMonth(startDate.getMonth() + 1);
              const endDate = el.endDate ? getDate(el.endDate) : getDate(exercise.characterAndSCCDate);
              if (el.tasks && el.tasks.length > 0) {
                if (el.tasks.includes('other')) {
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
                  issues.push(newEligibilityIssue('pqe', `Not Met (Candidate has ${relevantExperience.toString()} of relevant experience and ${otherExperience.toString()} to be checked)`));
                } else {
                  issues.push(newEligibilityIssue('pqe', `Not Met (${relevantExperience.toString()})`));
                }
              } else {
                issues.push(newEligibilityIssue('pqe', 'Not Met (Candidate has no relevant experience)'));
              }
            } else {
              issues.push(newEligibilityIssue('pqe', `Met (${relevantExperience.toString()})`));
            }
          } else {
            issues.push(newEligibilityIssue('pqe', 'Not Met (No experience provided)'));
          }
        } else {
          issues.push(newEligibilityIssue('pqe', 'Not Met (No qualifications provided)'));
        }
      } else {
        issues.push(newEligibilityIssue('pqe', 'Not Met (No qualifications provided)'));
      }

      // previous judicial experience
      const previousJudicialExperienceIssue = getPreviousJudicialExperienceIssue(exercise, application);
      if (previousJudicialExperienceIssue) issues.push(previousJudicialExperienceIssue);

    } else if (isNonLegalExercise) {
      // non-legal exercise

      // professional registration
      const professionalRegistrationIssue = getProfessionalRegistrationIssue(exercise, application);
      if (professionalRegistrationIssue) issues.push(professionalRegistrationIssue);
    }

    // get data from previous eligibility issues
    if (applicationRecord && applicationRecord.issues && Array.isArray(applicationRecord.issues.eligibilityIssues)) {
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const previousIssue = applicationRecord.issues.eligibilityIssues.find(i => i.type === issue.type);
        if (previousIssue) {
          issue.result = previousIssue.result;
          issue.comments = previousIssue.comments;
        }
      }
    }

    return issues;
  }

  function getQualificationIssue(exercise, application) {
    if (!exercise.qualifications || !exercise.qualifications.length) return null;
    if (!application.qualifications || !application.qualifications.length) return newEligibilityIssue('pq', 'Not Met');

    let isMet = false;
    for (let i = 0; i < exercise.qualifications.length; i++) {
      const qualification = exercise.qualifications[i];
      if (application.qualifications.find(item => item.type === qualification)) {
        isMet = true;
        break;
      }
    }

    return newEligibilityIssue('pq', isMet ? 'Met' : 'Not Met');
  }

  function getPreviousJudicialExperienceIssue(exercise, application) {
    if (!exercise.pjeDays) return null;

    // met: the number of sitting days acquired by the candidate (PQE is `judicial` with`the carrying-out of judicial functions of any court or tribunal`) is greater than or equal to what is requested
    let isMet = false;

    if (exercise._applicationVersion > 2) {
      if (Array.isArray(application.experience)) {
        const totalJudicialDays = application.experience.reduce((acc, cur) => {
          if (Array.isArray(cur.tasks) && cur.tasks.includes('judicial-functions') && cur.judicialFunctions && cur.judicialFunctions.type === 'judicial-post' && cur.judicialFunctions.duration) {
            acc += cur.judicialFunctions.duration;
          }
          return acc;
        }, 0);
        if (totalJudicialDays >= exercise.pjeDays) {
          isMet = true;
        }
      }
    } else {
      if (application.feePaidOrSalariedSatForThirtyDays) {
        isMet = true;
      }
    }

    return newEligibilityIssue('pje', isMet ? 'Met' : 'Not Met', application.experienceDetails);
  }

  function getProfessionalRegistrationIssue(exercise, application) {
    if (!exercise.memberships || !exercise.memberships.length || exercise.memberships.includes('none')) return null;

    const membershipData = [];
    const membershipList = [
      { field: 'charteredAssociationBuildingEngineersNumber', value: 'chartered-association-of-building-engineers' },
      { field: 'charteredInstituteBuildingNumber', value: 'chartered-institute-of-building' },
      { field: 'charteredInstituteEnvironmentalHealthNumber', value: 'chartered-institute-of-environmental-health' },
      { field: 'generalMedicalCouncilNumber', value: 'general-medical-council' },
      { field: 'royalCollegeOfPsychiatristsNumber', value: 'royal-college-of-psychiatrists' },
      { field: 'royalInstitutionCharteredSurveyorsNumber', value: 'royal-institution-of-chartered-surveyors' },
      { field: 'royalInstituteBritishArchitectsNumber', value: 'royal-institute-of-british-architects' },
    ];
    membershipList.forEach(item => {
      if (application[item.field]) {
        membershipData.push(lookup(item.value));
      }
    });

    return newEligibilityIssue('pr', membershipData.join(', '));
  }

  function getCharacterIssues(exercise, application) {

    let questions;
    let answers;

    if (exercise._applicationVersion >= 2) {
      questions = APPLICATION.CHARACTER_ISSUES_V2;
      answers = application.characterInformationV3 ? application.characterInformationV3 : application.characterInformationV2;
    } else if (application.characterInformation) {
      questions = APPLICATION.CHARACTER_ISSUES;
      answers = application.characterInformation;
    }

    const issues = [];

    if (questions && answers) {
      const groups = {};
      Object.keys(questions).forEach(key => {
        if (!groups[questions[key].group]) {
          groups[questions[key].group] = [key];
        } else {
          groups[questions[key].group].push(key);
        }
      });
      Object.keys(groups).forEach(issueType => {
        const events = [];
        let details;
        groups[issueType].forEach(key => {
          details = answers[questions[key].details];
          if (answers[key] && details) {
            const category = questions[key].title;
            if (Array.isArray(details)) { // if the answer contains more than one issue, create an issue for each
              events.push(...details.map(d => ({ ...d, category }))); //  append type (ex. bankruptcies) to the issue
            } else {
              events.push({ ...details, category }); // append type (ex. bankruptcies) to the issue
            }
          }
        });
        if (events.length) {
          issues.push(newCharacterIssue(issueType, issueType, events));
        }
      });
    } else {
      issues.push(newCharacterIssue('character', 'No character information'));
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

  setDays(days) {
    this.days = 0;
    return this;
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

const newCharacterIssue = (type, summary, events) => {
  return {
    type: type,
    summary: summary ? summary : '',
    events: events ? events : '',
    result: '',
    comments: '',
  };
};
const newEligibilityIssue = (type, summary, candidateComments) => {
  return {
    type: type,
    summary: summary ? summary : '',
    candidateComments: candidateComments ? candidateComments : '',
    result: '',
    comments: '',
  };
};
