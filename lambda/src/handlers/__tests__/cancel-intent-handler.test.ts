import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { setSessionAttributes } from '~/util/session-attributes';
import { YesNoIntentQuestion } from '../yes-no-intent-question';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/session-attributes', () => ({
  setSessionAttributes: jest.fn(),
  getSessionAttributes: () => jest.fn(),
}));

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

    expect(setSessionAttributes).toHaveBeenCalledWith(expect.anything(), {
      YesNoIntentQuestion: YesNoIntentQuestion.ShouldStopPromptingForReminders,
    });

    expect(result).toSpeek('No problem. Would you like to do something else?');
  });
});
