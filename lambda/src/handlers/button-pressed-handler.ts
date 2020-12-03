import * as Alexa from 'ask-sdk-core';

import { Response } from 'ask-sdk-model';
import { startCountdownIntentHandler } from './start-countdown-intent-handler';

export const buttonPressedHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id ===
        'createNewButton'
    );
  },
  handle(handlerInput: Alexa.HandlerInput): Response | Promise<Response> {
    console.log(
      'arguments:',
      JSON.stringify(
        (handlerInput.requestEnvelope.request as any).arguments,
        null,
        2,
      ),
    );

    // Redirect to StartCountdownIntent
    return startCountdownIntentHandler.handle(handlerInput);
  },
};
