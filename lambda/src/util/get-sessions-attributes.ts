import * as Alexa from 'ask-sdk-core';

/**
 * A wrapper for `handlerInput.attributesManager.getSessionAttributes()`
 * to allow for easier testing in Jest tests.
 * @param handlerInput The `handlerInput` provided to the handler
 */
export const getSessionAttributes = (handlerInput: Alexa.HandlerInput): any => {
  return handlerInput.attributesManager.getSessionAttributes();
};
