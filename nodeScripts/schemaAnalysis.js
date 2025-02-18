'use strict';

import { app, db } from './shared/admin.js';
import fs from 'fs';

const fieldCounts = {};

const analyzeCollection = async (collectionPath, parent = '') => {
  const collectionName = parent ? `${parent}/${collectionPath}` : collectionPath;
  console.log(`🔍 Analyzing collection: ${collectionName}...`);

  const snapshot = await db.collection(collectionPath).get();

  if (!fieldCounts[collectionName]) {
    fieldCounts[collectionName] = {};
  }

  let docCount = 0;
  for (const doc of snapshot.docs) {
    docCount++;

    // Count fields
    const data = doc.data();
    Object.keys(data).forEach(field => {
      fieldCounts[collectionName][field] = (fieldCounts[collectionName][field] || 0) + 1;
    });

    // Log progress every 100 documents
    if (docCount % 100 === 0) {
      console.log(`📄 Processed ${docCount} documents in ${collectionName}`);
    }

    // Check for subcollections
    const subcollections = await doc.ref.listCollections();
    for (const subcollection of subcollections) {
      console.log(`📂 Found subcollection: ${subcollection.id} in ${collectionName}`);
      await analyzeCollection(subcollection.id, collectionName);
    }
  }

  console.log(`✅ Completed: ${collectionName} (${docCount} documents)`);
};

const main = async () => {
  console.log(`🚀 Starting Firestore schema analysis for ${process.env.NODE_ENV}...`);
  
  // Get all top-level collections
  const collections = await db.listCollections();
  
  // Analyze each collection
  for (const collection of collections) {
    await analyzeCollection(collection.id);
  }

  // Generate CSV output
  console.log('📊 Generating CSV file...');
  let csvContent = 'Collection,Field,Count\n';
  for (const [collection, fields] of Object.entries(fieldCounts)) {
    for (const [field, count] of Object.entries(fields)) {
      csvContent += `${collection},${field},${count}\n`;
    }
  }

  // Write to file
  fs.writeFileSync(`Firestore_Schema-${process.env.NODE_ENV}.csv`, csvContent);
  console.log('✅ CSV file created: Firestore_Schema.csv');
  
  app.delete();
};

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    app.delete();
    process.exit();
  });
