import moment from 'moment';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import MockDate from 'mockdate';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/get-failure-interjection');

describe('reportCountdownIntentHandler', () => {
  let userAttributes: DaysUntilAttributes;

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'ReportCountdownIntent',
        confirmationStatus: 'NONE',
        slots: {
          CountdownEvent: {
            value: 'My Birthday',
          },
        },
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  beforeEach(() => {
    MockDate.set(new Date(Date.UTC(2001, 1, 3)));
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('when the requested countdown is found', async () => {
    userAttributes = {
      events: {
        'M BR0T': {
          eventName: 'My Birthday',
          eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
        },
      },
    };

    const result = await executeLambda(event);

    expect(result).toSpeek('2 days.');
  });

  test('when the requested countdown is not found', async () => {
    userAttributes = {
      events: {},
    };

    const result = await executeLambda(event);

    expect(result).toSpeek("Shoot! I don't see a countdown for My Birthday");
  });
});
