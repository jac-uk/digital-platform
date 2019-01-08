import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Configure and initialise Firebase
const config = {
  apiKey: "AIzaSyCJflOK3WP7tcs-GSJ3qS3_-xmQGoieasY",
  authDomain: "application-form-e08c9.firebaseapp.com",
  databaseURL: "https://application-form-e08c9.firebaseio.com",
  projectId: "application-form-e08c9",
  storageBucket: "application-form-e08c9.appspot.com",
  messagingSenderId: "260815078650"
};
firebase.initializeApp(config);

// Initialise Firestore
const firestore = firebase.firestore();

// Disable deprecated features (as recommended by Firestore docs: https://firebase.google.com/docs/firestore/quickstart)
firestore.settings({
  timestampsInSnapshots: true
});

// Initialise Auth
const auth = firebase.auth;

export {firestore, auth};
