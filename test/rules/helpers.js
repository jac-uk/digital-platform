import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp, setLogLevel } from 'firebase/firestore';
import fs from 'fs';

const projectId = `rules-spec-${Date.now()}`;
const rules = fs.readFileSync('database/firestore.rules', 'utf8');

let testEnv;

// Returns database instance used in your tests
export const setup = async (auth, data) => {
  setLogLevel('error');
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules,
    },
  });

  let db;
  if (auth && auth.uid) {
    const options = JSON.parse(JSON.stringify(auth));
    delete options.uid;
    db = testEnv.authenticatedContext(auth.uid, options).firestore();
  } else {
    db = testEnv.unauthenticatedContext().firestore();
  }

  if (data) {
    // Add data bypassing security rules
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      for (const key in data) {
        // console.log(key, data[key]);
        await db.doc(key).set(data[key]);
      }
    });
  }

  return db;
};

export const teardown = async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
};

export const getTimeStamp = (date) => {
  return Timestamp.fromDate(date);
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

export const getValidExerciseData = () => {
  return {
    referenceNumber: '000' + getRandomInt(100, 1000),
    progress: {started: true},
    state: 'draft',
    createdBy: 'user1',
  };
};

export const getValidMessageData = () => {
  return {
    referenceNumber: '000' + getRandomInt(100, 1000),
    status: 'created',
  };
};
