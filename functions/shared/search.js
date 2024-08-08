import { replaceCharacters } from './helpers.js';

export {
  getSearchMap,
  formatSearchTerm
};

function getSearchMap(searchables = []) {
  const searchMap = {};
  const n = 3;
  searchables.forEach(searchable => {
    if (searchable) {
      const src = formatSearchTerm(searchable.toLowerCase());
      for (let i = 0, len = src.length - n; i <= len; ++i) {
        searchMap[src.substring(i, i + n)] = true;
      }
    }
  });
  return searchMap;
}

/**
 * Firestore keys cannot contain certain (illegal) characters so replace them with an acceptable character
 * @param String str 
 */
function formatSearchTerm(str) {
  const characterMap = {
    '[': '-',
    ']': '-',
    '.': '-',
    '@': '-',
    '*': '-',
    '/': '-',
    '\\': '-',
  };
  return replaceCharacters(str, characterMap);
}
