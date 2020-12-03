import * as Alexa from 'ask-sdk-core';
import { db } from '~/adapters/dynamo-db';

export const firstLaunchInterceptor: Alexa.RequestInterceptor = {
  async process(input: Alexa.HandlerInput) {
    const lastLaunch = (await db.get(input.requestEnvelope)).lastLaunch;

    await db.put(input.requestEnvelope, {
      lastLaunch: new Date().getTime().toString(),
    });

    const attributes = input.attributesManager.getRequestAttributes();
    attributes.isFirstLaunch = !lastLaunch;
  },
};
