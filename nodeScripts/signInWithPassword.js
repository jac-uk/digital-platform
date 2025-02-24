'use strict';

//import { signInWithPassword } from '../functions/shared/google/identitytoolkit/accounts/signInWithPassword.js';
import initUsers from '../functions/actions/users.js';

const { signIn } = initUsers(null, null);

const email = 'kowei.hung@gmail.com';
const password = 'udiPBj99u8YCdK9eGc4F@';
const main = async () => {
  return await signIn(email, password);
};

main()
  .then((result) => {
    console.log(result);
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
