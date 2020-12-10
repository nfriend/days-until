import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('cancelIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'AMAZON.CancelIntent',
        confirmationStatus: 'NONE',
        slots: {},
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  test('prompts the user to try something else', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek('No problem. Would you like to do something else?');
  });
});
