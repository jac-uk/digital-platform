const Sentry = require('@sentry/serverless');
const { getAppEnvironment } = require('./helpers');

module.exports = (config) => {
  const appEnvironment = getAppEnvironment().toLowerCase();

  Sentry.GCPFunction.init({
    dsn: config.SENTRY_DSN,
  
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    environment: appEnvironment,
  });

  return {
    sentry: Sentry,
    wrapFunction: (fn) => async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    },
  };
};
