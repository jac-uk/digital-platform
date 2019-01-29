import {Timestamp} from "@/firebase";

const reviver = (key, value) => {
  // Convert serialized Timestamp objects to Date objects
  if (typeof value == 'object' && typeof value.seconds == 'number' && typeof value.nanoseconds == 'number') {
    value = new Timestamp(value.seconds, value.nanoseconds).toDate();
  }
  return value;
};

const sanitizeFirestore = (data) => {
  const json = JSON.stringify(data);
  return JSON.parse(json, reviver);
};

export default sanitizeFirestore;
