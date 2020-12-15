import * as Alexa from 'ask-sdk-core';
import _ from 'lodash';
import moment from 'moment-timezone';

/**
 * Returns the current device's timezone,
 * or a default if we can't access it.
 *
 * @param handlerInput The current handlerInput
 */
export const getUserTimezone = async (
  handlerInput: Alexa.HandlerInput,
): Promise<string> => {
  let userTimeZone: string;

  try {
    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();

    userTimeZone = await upsServiceClient.getSystemTimeZone(
      handlerInput.requestEnvelope.context.System.device.deviceId,
    );
  } catch (err) {
    // Do nothing
  }

  if (
    userTimeZone &&
    _.isString(userTimeZone) &&
    moment.tz.zone(userTimeZone)
  ) {
    return userTimeZone;
  } else {
    // Return a default timezone if we can't get the
    // device's actual time zone for some reason
    return 'America/Los_Angeles';
  }
};
