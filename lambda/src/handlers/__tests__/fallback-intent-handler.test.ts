import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('reportCountdownIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'AMAZON.FallbackIntent',
        confirmationStatus: 'NONE',
        slots: {},
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  test('saves a new countdown to the database', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek('inside the fallback handler');
  });
});
