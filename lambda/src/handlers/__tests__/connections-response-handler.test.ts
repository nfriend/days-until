import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { REMINDERS_PERMISSIONS_TOKEN } from '~/constants';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('connectionsResponseHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  let event: any;

  beforeEach(() => {
    event = createAlexaEvent({
      request: {
        type: 'Connections.Response',
        payload: {
          status: 'NOT_ANSWERED',
        },
        token: REMINDERS_PERMISSIONS_TOKEN,
      },
    });
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  describe('when the user grants permission to create reminders', () => {
    beforeEach(() => {
      event.request.payload.status = 'ACCEPTED';
    });

    test('prompts the user to restart the process of setting up reminders', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        'Now that I have your permission to create reminders, please say, <break strength="strong"/> "set up daily reminders" <break strength="strong"/> to pick up where we left off.',
      );
    });
  });

  describe('when the user denies permission to create reminders', () => {
    beforeEach(() => {
      event.request.payload.status = 'DENIED';
    });

    test("informs the user that Days Until can't create reminders without permission", async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        'Unfortunately, I can\'t create reminders without permission. If you\'d like to grant permission, you can do this by opening up this skill in the Alexa app or by saying, <break strength="strong"/> "ask Days Until to set up daily reminders."',
      );
    });
  });
});
