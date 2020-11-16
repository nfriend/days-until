import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

describe('LaunchRequestHandler', () => {
  const event = createAlexaEvent({
    request: {
      type: 'LaunchRequest',
    },
  });

  test('Greets the user', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek('Welcome to the new days until skill!');
  });
});
