import * as Alexa from 'ask-sdk-core';
import * as Sentry from '@sentry/node';

export class SentryInterceptor implements Alexa.RequestInterceptor {
  async process() {
    Sentry.init({
      dsn:
        'https://6dceb45e5b3b4c42a884877519960930@o403829.ingest.sentry.io/5518487',
      tracesSampleRate: 1.0,
      release: process.env.SENTRY_RELEASE_VERSION,
    });
  }
}
