'use strict';

import { app, db } from './shared/admin.js';
import fs from 'fs';

const getTitleStats = async () => {
  const stats = {};

  // Fetch all applications and select only the personalDetails.title field
  const applicationsSnapshot = await db.collection('applications')
    .select('personalDetails.title')
    .get();

  applicationsSnapshot.forEach(doc => {
    const title = doc.data()?.personalDetails?.title || 'Unknown';
    stats[title] = (stats[title] || 0) + 1;
  });

  return stats;
};

const main = async () => {
  const titleStats = await getTitleStats();

  // Convert stats to CSV format
  let csvContent = 'Title,Count\n';
  Object.entries(titleStats).forEach(([title, count]) => {
    csvContent += `${title},${count}\n`;
  });

  // Write CSV to a file
  fs.writeFileSync('Title_Stats.csv', csvContent);

  console.log('CSV file created: Title_Stats.csv');
  app.delete();
};

main()
  .catch((error) => {
    console.error(error);
    app.delete();
    process.exit();
  });
