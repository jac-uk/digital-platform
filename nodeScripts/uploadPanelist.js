const fs = require('fs');
const path = require('path');
const { firestore } = require('./shared/admin.js');
const admin = require('firebase-admin');

const collectionName = 'panellists'; // Make sure this is set to the correct collection name in Firestore
const collectionRef = admin.firestore().collection(collectionName);

function parseCSV(csvContent) {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');
  const data = [];

  for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length === headers.length) {
          const row = {};
          for (let j = 0; j < headers.length; j++) {
              row[headers[j].trim()] = values[j].trim();
          }
          data.push(row);
      }
  }

  return data;
}

function readCSV() {
  const csvContent = fs.readFileSync(path.join(__dirname, 'sheet.csv'), 'utf-8');
  const csvData = parseCSV(csvContent);
  return csvData;
}

async function addToFirestore(csvData) {
  try {
    const promises = csvData.map(async (row) => {
      row.created = admin.firestore.Timestamp.now();
      const docRef = await collectionRef.add(row);
      console.log('Document written with ID: ', docRef.id);
      return docRef;
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error('Error adding documents: ', error);
    throw error;
  }
}

async function main() {
  try {
    const csvData = readCSV();
    await addToFirestore(csvData);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
