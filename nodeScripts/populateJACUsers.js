'use strict';

const { app, db } = require('./shared/admin');
const { applyUpdates } = require('../functions/shared/helpers');
const { listAllUsers } = require('./shared/helpers');

const main = async () => {
  const commands = [];
  let users = await listAllUsers();
  users = users.filter(item => item.email.indexOf('@judicialappointments.') > 0);
  console.log(users);
  users.forEach((user) => {
    const data = {
      name: user.displayName,
      email: user.email,
      providerData: JSON.parse(JSON.stringify(user.providerData)),
      disabled: user.disabled,
      role: {
        id: user.customClaims.r,
        isChanged: false,
      },
    };
    commands.push({
      command: 'set',
      ref: db.collection('users').doc(user.uid),
      data,
    });
  });

  if (commands.length) {
    const res = await applyUpdates(db, commands);
    console.log(res);
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
