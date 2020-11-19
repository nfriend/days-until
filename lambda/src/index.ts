import * as Alexa from 'ask-sdk-core';
import { ErrorHandler } from './handlers/ErrorHandler';
import { IntentReflectorHandler } from './handlers/IntentReflectorHandler';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler';
import { StartCountdownIntentHandler } from './handlers/StartCountdownIntentHandler';
import { LocalizationInterceptor } from './interceptors/LocalizationInterceptor';
import { SentryInterceptor } from './interceptors/SentryInterceptor';

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    new LaunchRequestHandler(),
    new StartCountdownIntentHandler(),

    // IntentReflectorHandler needs to be last so that it doesn't
    // override any custom intent handlers
    new IntentReflectorHandler(),
  )
  .addRequestInterceptors(
    new SentryInterceptor(),
    new LocalizationInterceptor(),
  )
  .addErrorHandlers(new ErrorHandler())
  .lambda();
