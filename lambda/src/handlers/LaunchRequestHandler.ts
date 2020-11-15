import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
// import i18n from 'i18next';

export class LaunchRequestHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
  }
  handle(input: Alexa.HandlerInput): Response | Promise<Response> {
    return (
      input.responseBuilder
        // .speak(i18n.t('Welcome to the new days until skill!'))

        // TODO: why isn't i18n working?
        .speak('Welcome to the new days until skill!')
        .getResponse()
    );
  }
}
