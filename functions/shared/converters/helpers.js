const firebase = require('firebase-admin');
const Timestamp = firebase.firestore.Timestamp;

const addField = (array, label, value, lineBreak = false) => {
  if (value === undefined || value === null || value === '') {
    return;
  }
  if (typeof (value) === 'boolean') {
    value = toYesNo(value);
  }
  array.push({ value: value, label: label, lineBreak: lineBreak });
};

const toYesNo = (input) => {
  return input ? 'Yes' : 'No';
};

const toDateString = (date) => {
  const dateParts = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0]
    .split('-');
  return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
};

const formatDate = (value) => {
  if (value && (value.seconds || value._seconds)) { // convert firestore timestamp to date
    const seconds = value.seconds || value._seconds;
    const nanoseconds = value.nanoseconds || value._nanoseconds;
    value = new Timestamp(seconds, nanoseconds);
    value = value.toDate();
  }
  if (!isNaN(new Date(value).valueOf()) && value !== null) {
    if (!(value instanceof Date)) {
      value = new Date(value);
    }
    value = toDateString(value);
  }
  return value ? value : '';
};

module.exports = {
  addField, toYesNo, formatDate, toDateString,
};
