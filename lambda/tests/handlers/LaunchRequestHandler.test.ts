import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '../../src/adapters/dynamo-db';

jest.mock('../../src/util/choose-one');
jest.mock('../../src/adapters/dynamo-db');

describe('LaunchRequestHandler', () => {
  let userAttributes: DaysUntilAttributes;

  const event = createAlexaEvent({
    request: {
      type: 'LaunchRequest',
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  test('when this is the first time the user has launched the skill', async () => {
    userAttributes = {};

    const result = await executeLambda(event);

    const expected = [
      'Welcome to Days Until!',
      'Looks like this is your first visit!',
      'You can create a new countdown by saying something like <break strength="strong"/> <prosody pitch="+10%">"start a new countdown for my birthday."</prosody>',
      'Then, check on its status by saying <break strength="strong"/> <prosody pitch="+10%">"Ask Days Until, how long until my birthday?"</prosody>',
      'What would you like to do?',
    ].join(' ');

    expect(result).toSpeek(expected);
  });

  test('when the user has launched the skill previously', async () => {
    userAttributes = {
      lastLaunch: new Date().getTime().toString(),
    };

    const result = await executeLambda(event);

    expect(result).toSpeek(
      'Would you like to create a new countdown or check an existing one?',
    );
  });
});
