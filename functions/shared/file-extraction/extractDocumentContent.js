module.exports = (config, firebase) => {
  
  const SCAN_SERVICE_URL = config.SCAN_SERVICE_URL;
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

      console.log(templateContent, documentContent);
      
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

  function returnChanges(original, modified) {
    let changes = [];            // Initialize the changes array.
    let originalIndex = 0;        // Initialize the index for the original string.
    let modifiedIndex = 0;        // Initialize the index for the modified string.
    let insideChange = false;     // A flag to track whether we are inside a change sequence.
    let currentChange = '';       // Variable to accumulate characters for the current change.
  
    // Iterate through both strings until one of them is fully processed.
    while (originalIndex < original.length && modifiedIndex < modified.length) {
      if (original[originalIndex] === modified[modifiedIndex]) {
        if (insideChange) {
          // If we were inside a change sequence and now the characters match,
          // add the current change to the changes array.
          changes.push(currentChange);
          insideChange = false;   // Reset the change flag.
          currentChange = '';     // Reset the current change variable.
        }
        originalIndex++;         // Move to the next character in the original string.
        modifiedIndex++;         // Move to the next character in the modified string.
      } else {
        // If the characters are different, add the modified character to the current change.
        currentChange += modified[modifiedIndex];
        modifiedIndex++;         // Move to the next character in the modified string.
        insideChange = true;     // Set the change flag.
      }
    }
  
    // Add the last change to the changes array if there's any.
    if (insideChange) {
      changes.push(currentChange);
    }
  
    // Append any remaining characters from the modified string.
    if (modifiedIndex < modified.length) {
      changes.push(modified.substring(modifiedIndex));
    }
  
    return changes;  // Return the array representing the changes.
  }
  
};
