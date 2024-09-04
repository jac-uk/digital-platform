import getDocument from '@jac-uk/jac-kit/helpers/helpers.js';
import { getDocuments } from '@jac-uk/jac-kit/helpers/digitalPlatformHelpers.js';
import applyUpdates from '@jac-uk/jac-kit/helpers/helpers.js';

export default (config, firebase, db) => {
  return {
    changeIATemplate,
  };

  async function changeIATemplate (exerciseId) {

    const exercise = await getDocument(db.collection('exercises').doc(exerciseId));
    const availableFiles = exercise.downloads.independentAssessors;

    const correctFile = availableFiles[availableFiles.length - 1].file;

    const assessments = await getDocuments(db.collection('assessments')
      .where('exercise.id', '==', exerciseId)
    );

    const commands = [];

    assessments.forEach(a => {
      commands.push({
        command: 'update',
        ref: db.collection('assessments').doc(a.id),
        data: {
          'exercise.template.file': correctFile,
        },
      });
    });
    return await applyUpdates(db, commands);
  }};


