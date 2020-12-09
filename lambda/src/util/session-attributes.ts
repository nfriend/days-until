import * as Alexa from 'ask-sdk-core';

/**
 * A wrapper for `handlerInput.attributesManager.getSessionAttributes()`
 * to allow for easier testing in Jest tests.
 * @param handlerInput The `handlerInput` provided to the handler
 */
export const getSessionAttributes = (handlerInput: Alexa.HandlerInput): any => {
  return handlerInput.attributesManager.getSessionAttributes();
};

/**
 * A wrapper for `handlerInput.attributesManager.setSessionAttributes()`
 * to allow for easier testing in Jest tests.
 * @param handlerInput The `handlerInput` provided to the handler
 * @param attributes Attributes to set
 */
export const setSessionAttributes = (
  handlerInput: Alexa.HandlerInput,
  attributes: { [key: string]: any },
): any => {
  return handlerInput.attributesManager.setSessionAttributes(attributes);
};
