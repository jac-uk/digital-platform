/*
 * This script is used to refresh the content of the uploaded self-assessment file in the `applications` collection in firestore.
 *
 */

'use strict';

import { firebase, app, db } from './shared/admin.js';
import { applyUpdates, getDocument } from '../functions/shared/helpers.js';
import initExtractDocumentContent from '../functions/shared/file-extraction/extractDocumentContent.js';
import { log } from './shared/helpers.js';

const { extractDocumentContent } = initExtractDocumentContent(firebase);

// whether to make changes in `applications` collection in firestore
const isAction = false;
const applicationId = 'XpynYgjoDCHg46wGO1Bn';

const main = async () => {
  if (!applicationId) throw new Error('applicationId is required');

  const application = await getDocument(db.collection('applications').doc(applicationId));
  const exercise = await getDocument(db.collection('exercises').doc(application.exerciseId));

  if (
    !exercise.downloads || 
    !exercise.downloads.candidateAssessementForms || 
    !exercise.downloads.candidateAssessementForms[0] ||
    !application.uploadedSelfAssessment
  ) {
    throw new Error('File is not available');
  }

  const templatePath = `exercise/${exercise.id}/${exercise.downloads.candidateAssessementForms[0].file}`;
  const documentPath = `exercise/${exercise.id}/user/${application.userId}/${application.uploadedSelfAssessment}`;
  const questions = Array.isArray(exercise.selfAssessmentWordLimits) ? exercise.selfAssessmentWordLimits.map(section => section.question ? section.question.trim() : '') : [];

  log('templatePath: ' + templatePath);
  log('documentPath: ' + documentPath);
  const uploadedSelfAssessmentContent = await extractDocumentContent(templatePath, documentPath, questions);
  log('uploadedSelfAssessmentContent: ' + JSON.stringify(uploadedSelfAssessmentContent));

  if (isAction) {
    log('Apply updates...');
    const commands = [
      {
        command: 'update',
        ref: application.ref,
        data: {
          uploadedSelfAssessmentContent,
        },
      },
    ];
    const res = await applyUpdates(db, commands);
    log('Apply updates result: ' + res);
    log('Apply updates done');
  }

  return uploadedSelfAssessmentContent;
};

main()
  .then(() => {
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
