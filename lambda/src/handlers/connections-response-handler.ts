import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';
import { Response } from 'ask-sdk-model';
import { ASSETS_BASE_URL, REMINDERS_PERMISSIONS_TOKEN } from '~/constants';
import { chooseOne } from '~/util/choose-one';
import { buildRegularResponse } from '~/util/build-regular-response';

export const connectionsResponseHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Connections.Response' &&
      (handlerInput.requestEnvelope.request as any).token ===
        REMINDERS_PERMISSIONS_TOKEN
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    console.log(
      'inside connectionsResponseHandler. request:',
      JSON.stringify(handlerInput.requestEnvelope.request, null, 2),
    );

    if (
      (handlerInput.requestEnvelope.request as any).payload.status ===
      'ACCEPTED'
    ) {
      // the user has accepted our request for reminder permissions

      const cardTitle = i18n.t('Permission granted');
      const visualText = i18n.t(
        'Now that Days Until has permission, try saying "set up daily reminders"',
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/positive-vote.png`;

      const speak = i18n.t(
        'Now that I have your permission to create reminders, please say "set up daily reminders" to pick up where we left off.',
      );

      const reprompt = chooseOne(
        i18n.t('Sorry, please say "set up daily reminders".'),
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .withShouldEndSession(false)
        .getResponse();
    } else {
      // the user has not accepted our request for reminder permissions

      const cardTitle = i18n.t('Permission denied');
      const visualText = i18n.t(
        "Days Until can't create reminders without permission.",
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/sad.png`;

      const speak = i18n.t(
        'Unfortunately, I can\'t create reminders without permission. If you\'d like to grant permission, you can do this by opening up this skill in the Alexa app or by saying "ask Days Until to set up daily reminders."',
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};
