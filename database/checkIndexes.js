// 
// node database/checkIndexes.js
const json = require('./firestore.indexes.json');

const filtered = json.indexes.filter((value, index) => {
  const _value = JSON.stringify(value);
  return index !== json.indexes.findIndex(obj => {
    return JSON.stringify(obj) === _value;
  });
});


console.log('duplicates: ', filtered.length);
filtered.forEach(found => console.log(found));
