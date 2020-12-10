import moment from 'moment';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import MockDate from 'mockdate';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('listAllCountdownsIntentHandler', () => {
  let userAttributes: DaysUntilAttributes;

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'ListAllCountdownsIntent',
        confirmationStatus: 'NONE',
        slots: {},
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

  describe("when the user hasn't yet created any countdowns", () => {
    beforeEach(() => {
      userAttributes = {};
    });

    test("tells the user that they don't yet have any countdowns", async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        'You don\'t have any countdowns! To create one, say "create a new countdown."',
      );
    });
  });

  describe('when the user has created exactly one countdown', () => {
    beforeEach(() => {
      userAttributes = {
        events: {
          'M BR0T': {
            eventName: 'My Birthday',
            eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
          },
        },
      };
    });

    test('lists a single countdown', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        'You only have one countdown. My Birthday is in 2 days.',
      );
    });
  });

  describe('when the user has created more than one countdown', () => {
    beforeEach(() => {
      userAttributes = {
        events: {
          'M BR0T': {
            eventName: 'My Birthday',
            eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
          },
          SHRSTMS: {
            eventName: 'Christmas',
            eventDate: moment.utc('2001-12-25', 'YYYY-MM-DD').toISOString(),
          },
          'One in the past': {
            eventName: 'An event in the past',
            eventDate: moment.utc('2000-01-01', 'YYYY-MM-DD').toISOString(),
          },
        },
      };
    });

    test('lists each future countdown, ordered by soonest to most distant', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        [
          'You have 2 countdowns.',
          'My Birthday is in 2 days.',
          'Christmas is in 325 days.',
        ].join(' '),
      );
    });
  });
});
