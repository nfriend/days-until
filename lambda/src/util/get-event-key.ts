import * as natural from 'natural';

/**
 * Gets a metaphone'd version of the provided event name,
 * allowing it to be used as a lookup key (to allow for slight
 * variations in spelling)
 * @param eventName The name of the event
 */
export const getEventKey = (eventName: string): string => {
  return natural.Metaphone.process(eventName);
};
