
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
