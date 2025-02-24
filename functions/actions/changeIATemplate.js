import { getDocument, getDocuments, applyUpdates } from '../shared/helpers.js';

export default (db) => {
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


