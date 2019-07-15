const firebaseFunctionsTest = require('firebase-functions-test')();
const firebasemock = require('firebase-mock');
const REFERENCE_CODE_FIELD_NAME = 'Unique reference code - for JAC use only';

let mockauth, mockfirestore, mocksdk, firebaseAdmin, emailSent;

beforeEach(async () => {
  mockauth = new firebasemock.MockAuthentication();
  mockfirestore = new firebasemock.MockFirestore();
  // we need only auth() and firestore(), so we return null
  // for all other services
  mocksdk = new firebasemock.MockFirebaseSdk(
    // use null if your code does not use RTDB
    (path) => null,
    // use null if your code does not use AUTHENTICATION
    () => mockauth,
    // use null if your code does not use FIRESTORE
    () => mockfirestore,
    // use null if your code does not use STORAGE
    () => null,
    // use null if your code does not use MESSAGING
    () => null,
    );

  // mock firebase-admin before each test
  jest.mock('firebase-admin', () => {
    return mocksdk;
  });
  
  // set up for sendEmail test
  firebaseFunctionsTest.mockConfig({notify: {key: 'test-key'}});
  emailMock = setupEmailMock(() => emailSent = true);
  emailSent = false;

  // we need to set autoFlush for async oerations to prevent timeOut as by default firebaseMock won't wait for operation to complete
  firebaseAdmin = require('firebase-admin');
  firebaseAdmin.auth().autoFlush();
  firebaseAdmin.firestore().collection('usersTests').autoFlush(1000);
  firebaseAdmin.firestore().collection('userTestSubmissions').autoFlush(100);
  await firebaseAdmin.auth().createUser({uid: 'test-user-id', email: 'alex@test.com', password: 'testpassword'});

  // as firebase-mock supports `firestore.FieldValue.serverTimestamp` only for `update` operations,
  // because we use `set` operation to save userTestSubmission, `finishedAt` field won't be populated
  // this is why we replace `serverTimestamp` implementation with a custom object to
  // assert on this object to make sure that the same `finishedAt`` timestamp is used for both
  // userTest and userTestSubmission
  firebaseAdmin.firestore.FieldValue.serverTimestamp = () => ({isEqual: () => false, type: 'submission-test'});

});

function setupEmailMock(f) {
  return jest.mock('notifications-node-client', () => ({
    NotifyClient: jest.fn().mockImplementation(() => ({
      sendEmail: () => new Promise(resolve => {
        f();
        return resolve();
      })
    }))
  }));
}

describe('Submission', () => {
  // set up req and res with callback function
  const req = {
    body: { 
      confirmationTemplate: 'the template',
      ['Unique reference code - for JAC use only']: 'test-reference-code',
    }
  };

  const res = {
    status: (code) => ({
      send: (payload) => {
        testHandler(payload);
      }
    })
  };

  it('should save a new submission and send notification to user', (done) => {
    firebaseAdmin.firestore().collection('usersTests').doc('test-reference-code').set({
      startedAt: 12345,
      test: '/tests/test-id',
      userUid: 'test-user-id',
    });

    testHandler = async () => {
      let userTestSubmissionSnapshot = await firebaseAdmin.firestore().collection('userTestSubmissions').get();
      let userTestSubmission = userTestSubmissionSnapshot.docs[0].data();

      expect(userTestSubmissionSnapshot.docs.length).toBe(1);
      expect(userTestSubmission.userTest.id).toBe('test-reference-code');
      expect(userTestSubmission[REFERENCE_CODE_FIELD_NAME]).toBe('test-reference-code');
      expect(emailSent).toBe(true);
      return done();
    };

    const submission = require('./submission.js');
    submission(req, res);
  })

  it('does not save submission or send email when userTest is missing', (done) => {    
    testHandler = async () => {
      let userTestSubmissionSnapshot = await firebaseAdmin.firestore().collection('userTestSubmissions').get();
      expect(userTestSubmissionSnapshot.docs.length).toBe(0);
      expect(emailSent).toBe(false);

      return done();
    };

    const submission = require('./submission.js');
    submission(req, res);
  });

  it('should not save timestamp if finishedAt already exists', (done) => {
    firebaseAdmin.firestore().collection('usersTests').doc('test-reference-code').set({
      startedAt: 12345,
      test: '/tests/test-id',
      userUid: 'test-user-id',
    });

    const submission = require('./submission.js');

    testHandler = async () => {
      let userTest = await firebaseAdmin.firestore().collection('usersTests').doc('test-reference-code').get();
      let userTestSubmissionSnapshot = await firebaseAdmin.firestore().collection('userTestSubmissions').get();

      expect(userTest.data().finishedAt.type).toBe('submission-test');
      expect(userTestSubmissionSnapshot.docs.length).toBe(1);

      // setup before sending duplicate submission
      // 1. redefine our custom timestamp object
      firebaseAdmin.firestore.FieldValue.serverTimestamp = () => ({isEqual: () => false, type: 'duplicate-submission-test'});
      // 2. manually reset emailSent variable
      emailSent = false;

      testHandler = async() => {
        userTest = await firebaseAdmin.firestore().collection('usersTests').doc('test-reference-code').get();
        userTestSubmissionSnapshot = await firebaseAdmin.firestore().collection('userTestSubmissions').get();

        // finishedAt should stay the same as from the first submission
        expect(userTest.data().finishedAt.type).toBe('submission-test');
        // there should be only first user test submission in the db
        expect(userTestSubmissionSnapshot.docs.length).toBe(1);
        expect(emailSent).toBe(false);

        return done();  
      };

      // sending duplicate
      submission(req, res);
    };

    submission(req, res);
  });
})