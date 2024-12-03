/**
 * This script will list candidate emails for communication in a candidate_emails_for_comm.csv .
 * The candidates will meet a least one of following criteria:
 *  - Applied on or after 1 September 2023, can specify date with appliedAfter variable.
 *  - Register on Apply site in 6 months (from today). 
 * 
 * EXAMPLE USAGE:
 *   ```
 *   npm run nodeScript listCandidateEmailsForComm
 *   ```
 */

'use strict';

import { db } from './shared/admin.js';
import _ from 'lodash';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const appliedAfter = new Date('09-01-2023');

async function listEmailsAppliedAfter(date) {
  const batchSize = 100;
  let allEmails = [];
  let lastApplicationDoc = null;
  let snapshot = null;
  let query = null;

  do {
      query =  db.collection('applications')
      .where('appliedAt', '>=', date)
      .orderBy('appliedAt');

      if (lastApplicationDoc) {
        query = query.startAfter(lastApplicationDoc);
      }
      query = query.limit(batchSize);

      snapshot = await query.get();
      if (snapshot.docs.length < 1) {
        break;
      } 

      lastApplicationDoc = snapshot.docs[snapshot.docs.length -1];
      snapshot.forEach((doc) => {
        const document = doc.data();
        if (document && document.personalDetails && document.personalDetails.email) {
          allEmails.push(document.personalDetails.email);
        }
      });

  } while (snapshot.docs.length >= batchSize);

  allEmails = _.uniq(allEmails);
  console.log('total', allEmails.length);
  console.log(allEmails);

  return allEmails;
}

async function listCandidateEmailsRegisteredInLastSixMonths() {
  const batchSize = 100;
  let allEmails = [];
  let lastDoc = null;
  let snapshot = null;
  let query = null;

  do {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      query =  db.collection('candidates')
      .where('created', '>=', sixMonthsAgo)
      .orderBy('created');

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      query = query.limit(batchSize);

      snapshot = await query.get();
      if (snapshot.docs.length < 1) {
        break;
      } 

      lastDoc = snapshot.docs[snapshot.docs.length -1];
      snapshot.forEach((doc) => {
        const document = doc.data();
        if (document && document.email) {
          allEmails.push(document.email);
        }
      });

  } while (snapshot.docs.length >= batchSize);

  allEmails = _.uniq(allEmails);
  console.log('total', allEmails.length);
  console.log(allEmails);

  return allEmails;
}

const main = async () => {

  const emails1 = await listEmailsAppliedAfter(appliedAfter);
  const emails2 = await listCandidateEmailsRegisteredInLastSixMonths();
  const allEmails = _.union(emails1, emails2);
 
 const headers = [
   { id: 'email', title: 'email' },
 ];
 const output = createCsvWriter({
   path: 'candidate_emails_for_comm.csv',
   header: headers,
 });
 await output.writeRecords(allEmails.map((email) => ({ email })));
 
 console.log('total', allEmails.length);
 return allEmails;
};



main()
  .then((result) => {
    console.log('result', result);
    return process.exit();
  })
  .catch((error) => {
    console.error('error', error);
    process.exit();
  });
