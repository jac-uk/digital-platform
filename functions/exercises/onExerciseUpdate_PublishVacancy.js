/**
 * On exercise update ensure vacancy document is created, updated or deleted
 *  - When an exercise is first marked as published (`published: true`) create a corresponding vacancy document
 *  - Update vacancy document when a draft or ready-for-approval exercise is updated
 *  - When an exercise is first unpublished (`published: false`) delete the corresponding vacancy document
 */

const functions = require('firebase-functions');
const { db, setData, slog } = require('../sharedServices');

exports.onExerciseUpdate_PublishVacancy = functions.region('europe-west2').firestore
.document('exercises/{exerciseId}')
.onUpdate((change, context) => {
  const data = change.after.data();
  const previousData = change.before.data();
  
  if (data.published === true) {
    if (
      previousData.published !== true || (
        previousData.published === true && 
        (previousData.state === 'draft' || previousData.state === 'ready') 
      )
    ) {
      const vacancyModel = {
        name: null,
        referenceNumber: null,
        estimatedLaunchDate: null,
        applicationOpenDate: null,
        applicationCloseDate: null,
        roleSummary: null,
        subscriberAlertsUrl: null,
        aboutTheRole: null,
      };
      const vacancy = { ...vacancyModel };
      for (var key in vacancyModel) {
        if (data[key]) {
          vacancy[key] = data[key];
        }
      }
      setData('vacancies', context.params.exerciseId, vacancy);
    }
  }
  if (data.published === false) {
    if (previousData.published === true) {
      try {
        db.collection('vacancies').doc(context.params.exerciseId).delete();
        console.log('Un-publish exercis;e. Document deleted', { collection: 'vacancies', id: context.params.exerciseId });
      } catch (e) {
        // do nothing
      }
    }
  }

});
