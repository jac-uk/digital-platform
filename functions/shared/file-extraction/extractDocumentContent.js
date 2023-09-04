module.exports = (config, firebase) => {
  
  const SCAN_SERVICE_URL = config.SCAN_SERVICE_URL;
  const mammoth = require('mammoth');
  
  return {
    extractDocumentContent,
  };

  function returnChanges(original, modified) {
    let changes = '';             // Initialize the changes string.
    let originalIndex = 0;        // Initialize the index for the original string.
    let modifiedIndex = 0;        // Initialize the index for the modified string.
    let insideChange = false;     // A flag to track whether we are inside a change sequence.
    let hasAddedChange = false;   // A flag to track whether a change has been added.
  
    // Iterate through both strings until one of them is fully processed.
    while (originalIndex < original.length && modifiedIndex < modified.length) {
      if (original[originalIndex] === modified[modifiedIndex]) {
        if (insideChange) {
          // If we were inside a change sequence and now the characters match,
          // add a single line break to separate the change sequence.
          changes += '\n \n';
          insideChange = false;   // Reset the change flag.
          hasAddedChange = true; // Set the flag to indicate that a change has been added.
        }
        originalIndex++;         // Move to the next character in the original string.
        modifiedIndex++;         // Move to the next character in the modified string.
      } else {
        // If the characters are different, add the modified character to the changes string.
        changes += modified[modifiedIndex];
        modifiedIndex++;         // Move to the next character in the modified string.
        insideChange = true;     // Set the change flag.
        hasAddedChange = true;   // Set the flag to indicate that a change has been added.
      }
    }
  
    // Append any remaining characters from the modified string.
    if (modifiedIndex < modified.length) {
      changes += modified.substring(modifiedIndex);
    }
  
    // If a change was added at the end, remove the trailing line break.
    if (hasAddedChange && changes.endsWith('\n \n')) {
      changes = changes.slice(0, -3);
    }
  
    return changes;  // Return the generated string representing the changes.
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
