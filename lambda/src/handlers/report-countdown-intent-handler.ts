import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';

const INTENT_NAME = 'ReportCountdownIntent';

export const reportCountdownIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    // If the user pressed a "Check an existing countdown" button
    const wasCreateButtonPushed =
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id ===
        'checkExistingButton';

    // If the intent was triggered normally, e.g. when the user
    // says "Check on an existing countdown"
    const wasCreateIntentRequested =
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'ReportCountdownIntent' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME;

    // This handler handles both
    return wasCreateButtonPushed || wasCreateIntentRequested;
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    return handlerInput.responseBuilder
      .speak('Hey! Not implemented yet.')
      .withShouldEndSession(true)
      .getResponse();
  },
};
