import * as Alexa from 'ask-sdk-core';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler';

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(new LaunchRequestHandler())
  .lambda();
