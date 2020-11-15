import * as Alexa from 'ask-sdk-core';
import { IntentReflectorHandler } from './handlers/IntentReflectorHandler';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler';

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    new LaunchRequestHandler(),

    // IntentReflectorHandler needs to be last so that it doesn't
    // override any custom intent handlers
    new IntentReflectorHandler(),
  )
  .lambda();
