let crypto;
try {
  crypto = require('crypto');
  console.log('got crypto');
  const hash = crypto.createHash('sha1')
    .update('text to convert to hash')
    .digest('hex');
  console.log('hash', hash);
} catch (err) {
  console.log('crypto support is disabled!');
}
