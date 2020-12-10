import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/get-failure-interjection');

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

  test('responds with some instructions on how to use the skill', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek(
      "Shoot! Sorry, but Days Until doesn't know how to do that! You can create, check, and delete countdowns, and also set countdown reminders. What would you like to do?",
    );
  });
});
