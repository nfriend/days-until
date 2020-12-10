import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('helpIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'AMAZON.HelpIntent',
        confirmationStatus: 'NONE',
        slots: {},
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  test('Responds with some help', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek(
      [
        'Start by creating a new countdown. You can do this by saying, "Ask Days Until to create a new countdown".',
        'Once you\'ve created a countdown, you can check on its status by saying, "how many days until my birthday", for example.',
        'Or, check all your countdowns by saying, "list all my countdowns".',
        'You can delete a countdown by saying, "Ask Days Until to delete a countdown".',
        "There's also a few other things I can do. See this skill's description in the Alexa App for a complete list.",
        'Hopefully that helped! Now, what would you like to do?',
      ].join(' '),
    );
  });
});
