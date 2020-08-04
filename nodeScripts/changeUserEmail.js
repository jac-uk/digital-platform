'use strict';

const { app, auth } = require('./shared/admin.js');

const main = async () => {
  try {
    const user = await auth.getUserByEmail('warren2@precise-minds.co.uk');
    return auth.updateUser(user.uid, { email: 'warren2@precise-minds.co.uk' });
  } catch(e) {
    // console.log(e);
    return false;
  }
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
