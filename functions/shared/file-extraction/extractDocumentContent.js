import mammoth from 'mammoth';

export default (firebase) => {
  return {
    extractDocumentContent,
  };

  /*
   * Extract and compare document content
   * 
   * @param {string} templatePath - The path to the template file in the storage
   * @param {string} documentPath - The path to the document file in the storage
   * @param {array}  questions    - List of questions used to extract the answers from the document
   */
  async function extractDocumentContent(templatePath, documentPath, questions) {
    const bucket = firebase.storage().bucket(process.env.STORAGE_URL);
  
    try {
      // Download template and document files
      const [templateContent, documentContent] = await Promise.all([
        bucket.file(templatePath).download(),
        bucket.file(documentPath).download(),
      ]);

      // Extract raw text content using mammoth library (each paragraph is followed by two newlines `\n\n`)
      const [templateResult, documentResult] = await Promise.all([
        mammoth.extractRawText({ buffer: templateContent[0] }),
        mammoth.extractRawText({ buffer: documentContent[0] }),
      ]);
  
      // Extracted content from template and document
      const extractedTemplateContent = templateResult.value;
      const extractedDocumentContent = documentResult.value;
  
      // Return changes between template and document content
      return returnChanges(extractedTemplateContent, extractedDocumentContent, questions);
    } catch (error) {
      // Handle errors and log them
      console.error('Error:', error);
      throw error;
    }
  }

  function returnChanges(original, modified, questions) {
    // Split the strings into paragraphs and compare them
    const originalParagraphs = original.split('\n\n');
    const modifiedParagraphs = modified.split('\n\n')
      .map(paragraph => {
        const value = paragraph ? paragraph.trim() : '';
        if (questions.includes(value)) return value;
        return paragraph;
      })
      .filter(paragraph => {
      if (!paragraph.trim()) return false;
      // Keep questions in the list
      if (questions.includes(paragraph.trim())) return true;
      const index = originalParagraphs.indexOf(paragraph);
      if (index > -1) {
        // Remove the paragraph from the original list to avoid duplicates
        originalParagraphs.splice(index, 1);
        return false;
      }
      return true;
    });

    if (!questions || !questions.length) return modifiedParagraphs;

    const changes = []; // Store final changes
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const startIndex = modifiedParagraphs.indexOf(question); // Find the question in the modified list
      const endIndex = modifiedParagraphs.indexOf(questions[i + 1]); // Find the next question in the modified list
      if (startIndex === -1) {
        changes.push('');
        continue;
      }
      // Extract the paragraphs between the question and the next question
      const paragraphs = endIndex === -1 ? modifiedParagraphs.slice(startIndex + 1) : modifiedParagraphs.slice(startIndex + 1, endIndex);
      changes.push(paragraphs.join('\n'));
    }

    return changes;
  }

};
