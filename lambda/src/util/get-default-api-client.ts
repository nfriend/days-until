import * as Alexa from 'ask-sdk-core';

export const getDefaultApiClient = () => {
  return new Alexa.DefaultApiClient();
};
