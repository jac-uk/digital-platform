// 
// node database/checkIndexes.js
import fs from 'fs';
    
import json from './firestore.indexes.json';

function returnOnlyUnique(array) {
  console.log('All: ', array.length);
  return array.filter((value, index) => {
    const _value = JSON.stringify(value);
    return index === array.findIndex(obj => {
      return JSON.stringify(obj) === _value;
    });
  });
}

// const filtered = returnOnlyUnique(json.fieldOverrides);
const filtered = returnOnlyUnique(json.indexes);
console.log('Filtered: ', filtered.length);

fs.writeFile('./database/OUTPUT.json', JSON.stringify(filtered), (err) => {
  if (err)
    console.log(err);
  else {
    console.log('File written successfully\n');
    console.log('The written has the following contents:');
  }
});
