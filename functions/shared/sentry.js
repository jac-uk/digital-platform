const Sentry = require('@sentry/serverless');
const { getAppEnvironment, getPackageVersion } = require('./helpers');

module.exports = (config) => {
  const appEnvironment = getAppEnvironment().toLowerCase();
  const version = getPackageVersion();

  Sentry.GCPFunction.init({
    dsn: config.SENTRY_DSN,
  
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: appEnvironment,
    release: version,
  });

  return {
    sentry: Sentry,
    wrapFunction: (fn) => async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        if (appEnvironment !== 'develop') {
          Sentry.captureException(error);
        }
        throw error;
      }
    },
  };
};
