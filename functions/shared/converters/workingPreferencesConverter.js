import { ConverterV1 } from './workingPreferencesConverters/ConverterV1.js';
import { ConverterV2 } from './workingPreferencesConverters/ConverterV2.js';
import has from 'lodash/has.js';

/**
 * Work out what the version of the working prefs questions are
 * @param {Object} exercise 
 * @returns 
 */
function getVersion(exercise, prefsType) {
  if (prefsType === 'location') {
    return has(exercise, 'locationPreferences') ? 2 : 1;
  }
  if (prefsType === 'jurisdiction') {    
    return has(exercise, 'jurisdictionPreferences') ? 2 : 1;
  }
  if (prefsType === 'additional') {  
    return has(exercise, 'additionalWorkingPreferences') && exercise.additionalWorkingPreferences.some((el) => 'groupAnswers' in el)
      ? 2
      : 1;
  }
  return null;
}

// Step 2: Implement a Lookup Function
function getVersionedConverter(exercise, prefsType) {
  const version = getVersion(exercise, prefsType);
  if (version ===  1) {
    return new ConverterV1();
  }
  else if (version === 2) {
    return new ConverterV2();
  }
  return null;
}

/**
 * Functions which will check the version of the question before using the approrpiate version to get the data
 */

function getJurisdictionPreferences(application, exercise) {
  const converter = getVersionedConverter(exercise, 'jurisdiction');
  return converter ? converter.getJurisdictionPreferences(application, exercise) : '';
}

function getLocationPreferences(application, exercise) {
  const converter = getVersionedConverter(exercise, 'location');
  return converter ? converter.getLocationPreferences(application, exercise) : '';
}

function getAdditionalWorkingPreferences(application, exercise) {
  const converter = getVersionedConverter(exercise, 'additional');
  return converter ? converter.getAdditionalWorkingPreferences(application, exercise) : '';
}

export { getJurisdictionPreferences, getLocationPreferences, getAdditionalWorkingPreferences };
