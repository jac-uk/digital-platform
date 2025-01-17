import { formatDate } from './helpers.js';
export default (config) => {

  return {
    formatExperience,
  };

  /**
   * Format candidate experience
   * 
   * @param {object} application 
   * @param {object} exercise 
   * @returns {Array} experience data
   * [
   *   {'Org/Business Name', 'Job Title', 'Start Date', 'End Date'},
   * ]
   */
  function formatExperience(application, exercise) {
    if (!application || !Array.isArray(application.experience) || !exercise) {
      console.error('Missing application or exercise');
      return [];
    }

    const isNonLegal = exercise.typeOfExercise === 'non-legal';

    const formatted = [];
    const experiences = application.experience;
    for (const experience of experiences) {
      const chunk = [];
      if (experience.orgBusinessName) {
        chunk.push(experience.orgBusinessName);
      }

      if (experience.jobTitle) {
        chunk.push(experience.jobTitle);
      }

      if (experience.startDate) {
        if (isNonLegal) {
          chunk.push(formatDate(experience.startDate, 'DD/MM/YYYY'));
        } else {
          chunk.push(formatDate(experience.startDate, 'MMM YYYY'));
        }
      }

      if (experience.endDate) {
        if (isNonLegal) {
          chunk.push(formatDate(experience.endDate, 'DD/MM/YYYY'));
        } else {
          chunk.push(formatDate(experience.endDate, 'MMM YYYY'));
        }
      } else {
        chunk.push('Ongoing');
      } 

      if (chunk.length) {
        formatted.push(chunk.join(' - '));
      }
    }

    return formatted;
  }

};
