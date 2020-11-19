import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';

export class LaunchRequestHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
  }
  handle(input: Alexa.HandlerInput): Response | Promise<Response> {
    return input.responseBuilder
      .speak(
        i18n.t(
          'Would you like to create a new countdown or check an existing one?',
        ),
      )
      .speak(
        i18n.t("I didn't catch that - can you repeat what you'd like to do?"),
      )
      .getResponse();
  }
}
