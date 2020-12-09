import * as Alexa from 'ask-sdk-core';
import { IntentRequest, Response } from 'ask-sdk-model';
import { REMINDERS_PERMISSIONS_TOKEN } from '~/constants';
import { getSessionAttributes } from '~/util/get-sessions-attributes';
import {
  createReminderIntentHandler,
  INTENT_NAME as CREATE_REMINDER_INTENT_NAME,
} from './create-reminder-intent-handler';

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
    (handlerInput.requestEnvelope.request as IntentRequest).intent = {
      name: CREATE_REMINDER_INTENT_NAME,
      slots: getSessionAttributes(handlerInput).slots,
      confirmationStatus: 'NONE',
    };

    return createReminderIntentHandler.handle(handlerInput);
  },
};
