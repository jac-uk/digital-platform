import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// Configure and initialise Firebase
// Config variables are pulled from the environment at build time
const config = {
  apiKey: 'AIzaSyD-1ChTYmtrmSD0UuvzV6y5GURkW9eRFvA',
  authDomain: 'digital-platform-staging.firebaseapp.com',
  databaseURL: 'https://digital-platform-staging.firebaseio.com',
  projectId: 'digital-platform-staging',
  storageBucket: 'digital-platform-staging.appspot.com',
  messagingSenderId: '67930184815',
  appId: '1:67930184815:web:02eb3850834d834f',
};
firebase.initializeApp(config);

// Initialise Firestore
const firestore = firebase.firestore();

// Other firebase exports
const auth = firebase.auth;
const functions = firebase.functions;
const Timestamp = firebase.firestore.Timestamp;

export {firestore, auth, functions, Timestamp};
export default firebase;
