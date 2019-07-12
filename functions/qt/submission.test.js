require('notifications-node-client')
const test = require('firebase-functions-test')();

jest.mock('firebase-admin');

describe('submission', function() {
  it('should update userTest with finishedAt timestamp and create userTestSubmission', async function() {
    let req = { body: { confirmationTemplate: 'the template' } };
    let res = {
      status: (code) => ({
        send: (payload) => {
          console.log(payload);
        }
      })
    };

    let userTestDoc = {};
    let userTestSubmissionDoc = {};

    jest.mock('notifications-node-client', () => ({
      NotifyClient: jest.fn().mockImplementation(() => ({
        sendEmail: () => new Promise(resolve => resolve())
      }))
    }));

    test.mockConfig({notify: {key: 'test-key'}});

    let mockedFirebaseAdmin = require('firebase-admin');
    mockedFirebaseAdmin.setUserTestCallback(p => userTestDoc = p);
    mockedFirebaseAdmin.setUserTestSubmissionCallback(p => userTestSubmissionDoc = p);
    mockedFirebaseAdmin.setUserTestData({"Hello": "hello" });
    
    const submission = require('./submission.js');  
    await submission(req, res);  
    
    expect(userTestDoc.finishedAt).toBe(42);
    expect(userTestSubmissionDoc.confirmationTemplate).toBe('the template');
    expect(userTestSubmissionDoc.finishedAt).toBe(42);
    expect(userTestSubmissionDoc.userTest.name).toBe('userTestDocRef');
  });
});
