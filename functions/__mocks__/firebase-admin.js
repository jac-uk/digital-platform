// ----- user test setup ---- 
let userTestCallback = jest.fn();
let userTestSubmissionCallback = jest.fn();
let userTestData;

console.log("userTestData: ", userTestData);

let userTestDoc = {
  name: 'userTestDoc',
  exists: true,
  data: () => ({
    startedAt: 10,
    test: 'test-reference',
    userUid: 'user-id'
  })
}

let userTestDocRef = {
  id: 'I AM TEST USER TEST DOC REF ID',
  name: 'userTestDocRef',
  get: () => new Promise(resolve => resolve(userTestDoc)),
  set: (payload) => userTestCallback(payload),
}

let userTests = {
  doc: () => new Promise(resolve => resolve(userTestDocRef)),
}

// ----- user test submissions setup ---- 

let userTestSubmissionRef = {
  id: 'I AM TEST USER SUBMISSION REF ID',
  set: (payload) => userTestSubmissionCallback(payload),
}

let userTestSubmissions = {
  doc: () => new Promise(resolve => resolve(userTestSubmissionRef)),
}

// ---------------------------------------
let firestore = {
  collection: (collectionName) => {
    if (collectionName === 'usersTests') {
      return userTests;
    } else {
      return userTestSubmissions;
    }
  }
}

let firestoreFunc = () => firestore;
firestoreFunc.FieldValue = {
  serverTimestamp: () => 42
};

module.exports = {
  setUserTestCallback: f => { userTestCallback = f },
  setUserTestSubmissionCallback: f => { userTestSubmissionCallback = f },
  setUserTestData: (data) => {userTestData = data},
  firestore: firestoreFunc,
  auth: () => ({
    getUser: () => new Promise(resolve => resolve({
      displayName: 'user-display-name',
      email: 'user@gmail.com',
    }))
  })
};
