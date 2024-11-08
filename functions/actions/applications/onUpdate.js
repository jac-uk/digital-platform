import { getDocument, applyUpdates, isDateInPast, formatDate } from '../../shared/helpers.js';
import { getSearchMap } from '../../shared/search.js';
import initCandidatesSearch from '../candidates/search.js';
import initApplications from './applications.js';

export default (config, firebase, db, auth) => {
  const { updateCandidate } = initCandidatesSearch(firebase, db);
  const { sendApplicationConfirmation, sendFullApplicationConfirmation, sendApplicationInWelsh, sendCharacterCheckRequests, sendCandidateFlagConfirmation } = initApplications(config, firebase, db, auth);

  return onUpdate;

  /**
   * Application event handler for Update
   * - if status has changed update the application counts on the exercise
   * - if application characterChecks.status changed, update application record
   * - if searchable fields have changed it adds the search map
   */
  async function onUpdate(applicationId, dataBefore, dataAfter) {
    const commands = [];
    if (dataBefore.status !== dataAfter.status) {
      // update stats if status has changed
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);
      const exerciseId = dataBefore.exerciseId;
      const data = {};
      console.log(`Update application counts: _applications.${dataBefore.status} decrease; _applications.${dataAfter.status} increase`);
      data[`_applications.${dataBefore.status}`] = decrement;
      data[`_applications.${dataAfter.status}`] = increment;
      data['_applications._lastUpdated'] = firebase.firestore.FieldValue.serverTimestamp();
      commands.push({
        command: 'update',
        ref: db.doc(`exercises/${exerciseId}`),
        data: data,
      });
      await applyUpdates(db, commands);

      // update candidate document
      await updateCandidate(dataAfter.userId);
      // update application record

      // applied
      if (dataBefore.status === 'draft' && dataAfter.status === 'applied') {
        const candidate = await getDocument(db.doc(`candidates/${dataAfter.userId}`));

        // send confirmation email if it has not been sent before
        if (candidate && candidate.isFlaggedCandidate && dataBefore.emailLog && !dataBefore.emailLog.flaggedCandidate) {
          await sendCandidateFlagConfirmation({
            applicationId,
            application: dataAfter,
          });
        }

        // send confirmation email if it has not been sent before
        if (!dataBefore.emailLog || (dataBefore.emailLog && !dataBefore.emailLog.applicationSubmitted)) {
          await sendApplicationConfirmation({
            applicationId,
            application: dataAfter,
          });
        }

        // application in welsh
        if (dataAfter._language === 'cym') {
          if (!dataBefore.emailLog || (dataBefore.emailLog && !dataBefore.emailLog.applicationInWelsh)) {
            await sendApplicationInWelsh({
              applicationId,
              application: dataAfter,
            });
          }
        }
      }

      // applied
      // if (dataAfter.status === 'applied') {
      //   const exercise = getDocument(db.doc(`exercises/${exerciseId}`));
      //   if (exercise.state === 'approved') {
      //     if (isDateInPast(exercise.applicationCloseDate)) {  // exercise is now closed
      //       // ensure an applicationRecord document is created
      //       commands.push({
      //         command: 'set',
      //         ref: db.collection('applicationRecords').doc(`${dataAfter.id}`),
      //         data: newApplicationRecord(firebase, exercise, dataAfter),
      //       });
      //     }
      //   }
      // }
    }

    const characterChecksBefore = dataBefore.characterChecks;
    const characterChecksAfter = dataAfter.characterChecks;

    if (characterChecksBefore && characterChecksAfter && characterChecksBefore.status && characterChecksAfter.status) {
      if ((characterChecksBefore.status !== characterChecksAfter.status) && characterChecksAfter.status === 'completed') {

        // send confirmation email if it hasn't been sent before
        if (!dataBefore.emailLog || (dataBefore.emailLog && !dataBefore.emailLog.characterCheckSubmitted)) {
          const exercise = await getDocument(db.doc(`exercises/${dataBefore.exerciseId}`));
          if (exercise) {
            await sendCharacterCheckRequests({
              items: [applicationId],
              type: 'submit',
              exerciseMailbox: exercise.exerciseMailbox,
              exerciseManagerName: exercise.emailSignatureName,
              dueDate: formatDate(exercise.characterChecksReturnDate),
            });
          }
        }
        
        try {
          await db.collection('applicationRecords').doc(`${applicationId}`).update({
            'characterChecks.status': 'completed',
            'characterChecks.completedAt': firebase.firestore.Timestamp.fromDate(new Date()),
          });
          return true;
        } catch (e) {
          console.error(`Error updating application record ${applicationId}`, e);
          return false;
        }
      }
    }

    // update first and second assessment assessor details
    const firstAssessmentData = {};
    if (dataBefore.firstAssessorType !== dataAfter.firstAssessorType) {
      firstAssessmentData['assessor.type'] = dataAfter.firstAssessorType || '';
    }
    if (dataBefore.firstAssessorFullName !== dataAfter.firstAssessorFullName) {
      firstAssessmentData['assessor.fullName'] = dataAfter.firstAssessorFullName || '';
    }
    if (dataBefore.firstAssessorEmail !== dataAfter.firstAssessorEmail) {
      firstAssessmentData['assessor.email'] = dataAfter.firstAssessorEmail || '';
    }
    if (Object.keys(firstAssessmentData).length) {
      await db.doc(`assessments/${applicationId}-1`).update(firstAssessmentData);
    }

    const secondAssessmentData = {};
    if (dataBefore.secondAssessorType !== dataAfter.secondAssessorType) {
      secondAssessmentData['assessor.type'] = dataAfter.secondAssessorType || '';
    }
    if (dataBefore.secondAssessorFullName !== dataAfter.secondAssessorFullName) {
      secondAssessmentData['assessor.fullName'] = dataAfter.secondAssessorFullName || '';
    }
    if (dataBefore.secondAssessorEmail !== dataAfter.secondAssessorEmail) {
      secondAssessmentData['assessor.email'] = dataAfter.secondAssessorEmail || '';
    }
    if (Object.keys(secondAssessmentData).length) {
      await db.doc(`assessments/${applicationId}-2`).update(secondAssessmentData);
    }

    // Build an object with changes to the application record
    let updateApplicationData = {};

    if (dataAfter.personalDetails && dataAfter.personalDetails.fullName &&
      (!dataBefore._sort || dataBefore._sort.fullNameUC !== dataAfter.personalDetails.fullName.toUpperCase())
    ) {
      updateApplicationData._sort = {};
      updateApplicationData._sort.fullNameUC = dataAfter.personalDetails.fullName.toUpperCase();
    }

    // Update search map if searchable keys have changed (ie name/ref no/email/NI No)
    const hasUpdatedName = dataBefore.personalDetails.fullName !== dataAfter.personalDetails.fullName;
    const hasUpdatedReferenceNumber = dataBefore.referenceNumber !== dataAfter.referenceNumber;
    const hasUpdatedEmail = dataBefore.personalDetails.email !== dataAfter.personalDetails.email;
    const hasUpdatedNINumber = dataBefore.personalDetails.nationalInsuranceNumber !== dataAfter.personalDetails.nationalInsuranceNumber;

    if (hasUpdatedName || hasUpdatedReferenceNumber || hasUpdatedEmail || hasUpdatedNINumber) {
      // Build search map
      const searchData = getSearchMap([
        dataAfter.personalDetails.fullName,
        dataAfter.personalDetails.email,
        dataAfter.personalDetails.nationalInsuranceNumber,
        dataAfter.referenceNumber,
      ]);

      // Only update the applicationRecord if it exists already (has same id as the application!)
      const applicationRecord = await getDocument(db.doc(`applicationRecords/${applicationId}`));
      if (applicationRecord) {
        // Update application record
        await db.collection('applicationRecords').doc(`${applicationId}`).update({
          _search: searchData,
          'candidate.fullName': dataAfter.personalDetails.fullName,
        });
      }

      // Merge search data into updateApplicationData
      updateApplicationData._search = searchData;
    }

    if (JSON.stringify(updateApplicationData) !== '{}') {

      // Update application
      return db.doc(`applications/${applicationId}`).update(updateApplicationData);
    }

    // Update status to 'Full application submitted', if submitted sections for 'Selection Days'
    const inSelectionDaysStage = dataAfter._processing ? (dataAfter._processing.stage === 'selection') : false;
    const submittedLogBefore = dataBefore._submittedLog || {};
    const submittedLogAfter = dataAfter._submittedLog || {};
    const selectionTimestampBefore = submittedLogBefore.selection ? submittedLogBefore.selection.toMillis() : null;
    const selectionTimestampLogAfter = submittedLogAfter.selection ? submittedLogAfter.selection.toMillis() : null;
    const hasSelectionDaysSubmitted = selectionTimestampBefore !== selectionTimestampLogAfter;
    console.log('selectionTimestampBefore', selectionTimestampBefore);
    console.log('selectionTimestampLogAfter', selectionTimestampLogAfter);
    console.log('inSelectionDaysStage', inSelectionDaysStage);
    console.log('hasSelectionDaysSubmitted', hasSelectionDaysSubmitted);
    if (inSelectionDaysStage && hasSelectionDaysSubmitted) {
      console.log('dataAfter', JSON.stringify(dataAfter));
      console.log('dataBefore', JSON.stringify(dataBefore));
      await db.collection('applicationRecords').doc(`${applicationId}`).update({
        status: 'fullApplicationSubmitted',
      });

      console.log('update status to fullApplicationSubmitted');
      if (!dataBefore.emailLog || (dataBefore.emailLog && !dataBefore.emailLog.fullApplicationSubmitted)) {
        console.log('sendFullApplicationConfirmation');
        await sendFullApplicationConfirmation({
          applicationId,
          application: dataAfter,
        });
      }

      console.log('sent full application submitted email');
    }

    // If change full application submitted to full application not submitted, reset related flags
    if ((dataBefore._processing && dataBefore._processing.status === 'fullApplicationSubmitted') 
      && (dataAfter._processing && dataAfter._processing.status === 'fullApplicationNotSubmitted')) {
      db.collection('applications').doc(applicationId).update({
        'emailLog.fullApplicationSubmitted': null,
        '_submittedLog.selection': null,
      });
    }

    return true;
  }
};
