import * as Alexa from 'ask-sdk-core';
import { adapter } from './adapters/dynamo-db';
import { ErrorHandler } from './handlers/ErrorHandler';
import { IntentReflectorHandler } from './handlers/IntentReflectorHandler';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler';
import { SessionEndedRequestHandler } from './handlers/SessionEndedRequestHandler';
import { StartCountdownIntentHandler } from './handlers/StartCountdownIntentHandler';
import { FirstLaunchInterceptor } from './interceptors/FirstLaunchInterceptor';
import { LocalizationInterceptor } from './interceptors/LocalizationInterceptor';
import { SentryInterceptor } from './interceptors/SentryInterceptor';

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    new LaunchRequestHandler(),
    new StartCountdownIntentHandler(),
    new SessionEndedRequestHandler(),

    // IntentReflectorHandler needs to be last so that it doesn't
    // override any custom intent handlers
    new IntentReflectorHandler(),
  )
  .addRequestInterceptors(
    new SentryInterceptor(),
    new FirstLaunchInterceptor(),
    new LocalizationInterceptor(),
  )
  .addErrorHandlers(new ErrorHandler())
  .withPersistenceAdapter(adapter)
  .lambda();
