module.exports = {
  getSearchMap,
};

function getSearchMap(searchables) {
  const searchMap = {};
  const n = 3;
  searchables.forEach(searchable => {
    if (searchable) {
      const src = searchable.toLowerCase();
      for (let i = 0, len = src.length - n; i <= len; ++i) {
        searchMap[src.substring(i, i + n)] = true;
      }
    }
  });
  return searchMap;
}
