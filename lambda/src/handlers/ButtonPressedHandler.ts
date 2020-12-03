import * as Alexa from 'ask-sdk-core';

import { Response } from 'ask-sdk-model';

export class ButtonPressedHandler implements Alexa.RequestHandler {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id === 'testButtonId'
    );
  }
  handle(handlerInput: Alexa.HandlerInput): Response | Promise<Response> {
    console.log(
      'arguments:',
      JSON.stringify(
        (handlerInput.requestEnvelope.request as any).arguments,
        null,
        2,
      ),
    );

    return handlerInput.responseBuilder
      .addDelegateDirective({
        name: 'StartCountdownIntent',
        confirmationStatus: 'NONE',
        slots: {},
      })
      .getResponse();
  }
}
