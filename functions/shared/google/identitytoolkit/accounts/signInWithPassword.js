import axios from 'axios';

export {
  signInWithPassword
};

//const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_API_KEY = '';
async function signInWithPassword(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const response = await axios.post(url, {
    email,
    password,
    returnSecureToken: true,
  });
  return response.data;
}

