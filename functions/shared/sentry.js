const Sentry = require('@sentry/serverless');

module.exports = (config) => {
  Sentry.GCPFunction.init({
    dsn: config.SENTRY_DSN,
  
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
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
