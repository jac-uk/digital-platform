module.exports = (config, firebase) => {
  
  const SCAN_SERVICE_URL = config.SCAN_SERVICE_URL;
  const mammoth = require('mammoth');
  
  return {
    extractDocumentContent,
  };

  function returnChanges(original, modified) {
    let changes = '';
    let originalIndex = 0;
    let modifiedIndex = 0;
    let insideChange = false;
  
    while (originalIndex < original.length && modifiedIndex < modified.length) {
      if (original[originalIndex] === modified[modifiedIndex]) {
        if (insideChange) {
          changes += '\n';
          insideChange = false;
        }
        originalIndex++;
        modifiedIndex++;
      } else {
        changes += modified[modifiedIndex];
        modifiedIndex++;
        insideChange = true;
      }
    }
  
    if (insideChange) {
      changes += '\n';
    }
  
    if (modifiedIndex < modified.length) {
      changes += modified.substring(modifiedIndex);
    }
  
    return changes;
  }  

  // Function to extract and compare document content
  async function extractDocumentContent(templatePath, documentPath) {
    const bucket = firebase.storage().bucket(config.STORAGE_URL);
  
    try {
      // Download template and document files
      const [templateContent, documentContent] = await Promise.all([
        bucket.file(templatePath).download(),
        bucket.file(documentPath).download(),
      ]);
  
      // Extract raw text content using mammoth library
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
  
};
