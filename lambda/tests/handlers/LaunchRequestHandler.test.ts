import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

xdescribe('LaunchRequestHandler', () => {
  const event = createAlexaEvent({
    request: {
      type: 'LaunchRequest',
    },
  });

  test('Greets the user', async () => {
    const result = await executeLambda(event);

    expect(result).toSpeek(
      'Would you like to create a new countdown or check an existing one?',
    );
  });
});
