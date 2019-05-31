import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

const initSentry = () => {
  Sentry.init({
    dsn: 'https://2ae111f2a62d4f7bbe84aaf868f0f0d5@sentry.io/1472344',
    integrations: [new Integrations.Vue({Vue, attachProps: true})],
  });
};

export {initSentry};
