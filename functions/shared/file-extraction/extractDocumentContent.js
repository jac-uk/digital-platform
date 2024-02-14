module.exports = (config, firebase) => {
  
  const mammoth = require('mammoth');
  
  return {
    extractDocumentContent,
  };

  // Function to extract and compare document content
  async function extractDocumentContent(templatePath, documentPath, sectionsInt) {
    const bucket = firebase.storage().bucket(config.STORAGE_URL);
  
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
      return returnChanges(extractedTemplateContent, extractedDocumentContent);
    } catch (error) {
      // Handle errors and log them
      console.error('Error:', error);
      throw error;
    }
  }

  function returnChanges(original, modified) {
    // Split the strings into paragraphs and compare them
    const originalParagraphs = original.split('\n\n');
    const modifiedParagraphs = modified.split('\n\n').filter(paragraph => {
      if (paragraph === '') return false;
      const index = originalParagraphs.indexOf(paragraph);
      if (index > -1) {
        // Remove the paragraph from the original list to avoid duplicates
        originalParagraphs.splice(index, 1);
        return false;
      }
      return true;
    });

    return modifiedParagraphs;
  }
  
};
