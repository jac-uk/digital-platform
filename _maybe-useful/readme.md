
# Snippets which may be useful

CSV writer
```
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
await csvWriter.writeRecords(data);
```

File system
```
  const fs = require('fs');
  fs.writeFile(outputFile, output, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
```

Check an email is valid
```
const emailIsValid = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```


Send verification email
```
const sendVerificationEmail = async (user) => {
  const email = user.email;
  const returnUrl = functions.config().production.url;
  const templateId = functions.config().notify.templates.verification;
  const verificationLink = await admin.auth().generateEmailVerificationLink(email, {url: returnUrl});
  return sendEmail(email, templateId, {
    'applicantName': user.displayName,
    verificationLink,
  });
};

exports.sendVerificationEmailOnNewUser = functions.region('europe-west2').auth.user().onCreate((user) => {
  return sendVerificationEmail(user);
});

```
