import { defineSecret } from 'firebase-functions/params';
import dotenv from 'dotenv';

dotenv.config(); // Load .env for local use

// A helper function to load secrets
export const getSecret = (secretName) => {
  // Try to get the secret from the environment variables in local development
  if (process.env[secretName]) {
    return process.env[secretName]; // Local development: .env file
  }

  // In production, get it from Firebase secrets
  const secret = defineSecret(secretName);
  return secret.value(); // Production: Firebase secret
};

export const getSecrets = (secretNames) => {
  return secretNames.reduce((secrets, secretName) => {
    secrets[secretName] = getSecret(secretName); // Get each secret
    return secrets;
  }, {});
};
