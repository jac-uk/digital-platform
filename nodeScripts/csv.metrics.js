'use strict';

import { app, db } from './shared/admin.js';
import fs from 'fs';

const getStatsForMonth = async (startDate, endDate) => {
  const stats = {};

  // Fetch data for Applications
  const applications = await db.collection('applications')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<', endDate)
    .select().get();
  stats.applications = applications.docs.length;

  // Fetch data for Candidates
  const candidates = await db.collection('candidates')
    .where('created', '>=', startDate)
    .where('created', '<', endDate)
    .select().get();
  stats.candidates = candidates.docs.length;

  // Fetch data for Exercises
  const exercises = await db.collection('exercises')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<', endDate)
    .select().get();
  stats.exercises = exercises.docs.length;

  return stats;
};

const main = async () => {
  const results = [];
  const startYear = 2025; // Starting from January 2021
  const endDate = new Date(); // Current date

  // Iterate over each month from startYear to the current month
  for (let year = startYear; year <= endDate.getFullYear(); year++) {
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const nextMonth = new Date(year, month + 1, 1);

      // Stop if we go beyond the current month
      if (startDate >= endDate) break;

      // Get stats for the current month
      const stats = await getStatsForMonth(startDate, nextMonth);
      results.push({
        Month: startDate.toLocaleString('default', { month: 'long' }),
        Year: year,
        Exercises: stats.exercises,
        Candidates: stats.candidates,
        Applications: stats.applications,
      });
    }
  }

  // Generate CSV content
  let csvContent = 'Month,Year,Exercises,Candidates,Applications\n';
  results.forEach(row => {
    csvContent += `${row.Month},${row.Year},${row.Exercises},${row.Candidates},${row.Applications}\n`;
  });

  // Write CSV to a file
  fs.writeFileSync('Monthly_Stats.csv', csvContent);

  console.log('CSV file created: Monthly_Stats.csv');
  app.delete();
};

main()
  .catch((error) => {
    console.error(error);
    app.delete();
    process.exit();
  });
