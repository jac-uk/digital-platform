import { getDocuments } from '../../shared/helpers.js';

export default (db) => {
  return checkDuplicateApplications;

  /**
   * Get all applications for a given exercise and check for duplicate NI numbers
   * Return the duplicates grouped by NI number and sorted by name
   * @param {*} params 
   * @returns 
   */
  async function checkDuplicateApplications(params) {
    const applicationDataRef = db.collection('applications').where('exerciseId', '==', params.exerciseId);
    const applications = await getDocuments(applicationDataRef);

    const niMap = new Map(); // Store NI numbers and related applications
    for (const application of applications) {
        if (!Object.prototype.hasOwnProperty.call(application, 'personalDetails') || 
            !Object.prototype.hasOwnProperty.call(application.personalDetails, 'nationalInsuranceNumber')) {
            continue; // Skip if no NI number
        }
        const niNumber = application.personalDetails.nationalInsuranceNumber?.trim() || '';
        if (niNumber.length === 0) {
            continue; // Skip if no NI number
        }

        const name = application.personalDetails.fullName;
        const referenceNumber = application.referenceNumber;

        if (!niMap.has(niNumber)) {
            niMap.set(niNumber, []);
        }
        niMap.get(niNumber).push({ referenceNumber, name, niNumber });
    }

    // Flatten the duplicates into a single array, sort by NI number first, then by name
    const duplicates = [...niMap.entries()]
        .filter(([_, apps]) => apps.length > 1) // Keep only duplicates
        .flatMap(([niNumber, apps]) => apps.sort((a, b) => a.name.localeCompare(b.name))); // Sort by name

    return { duplicates };
  }


};
