import moment from 'moment';
import _ from 'lodash';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { getDefaultApiClient } from '~/util/get-default-api-client';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/get-failure-interjection');
jest.mock('~/util/get-default-api-client');

describe('deleteCountdownIntentHandler', () => {
  let userAttributes: DaysUntilAttributes;

  let event: any;

  beforeEach(() => {
    jest.spyOn(getDefaultApiClient(), 'invoke');

    event = createAlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'DeleteCountdownIntent',
          confirmationStatus: 'NONE',
          slots: {
            CountdownEvent: {
              value: 'My Birthday',
            },
          },
        },
      },
      context: {
        System: {
          user: {
            permissions: {},
          },
        },
      },
    });

    userAttributes = {
      events: {
        'M BR0T': {
          eventName: 'My Birthday',
          eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
        },
      },
    };
  });

  afterEach(() => {
    event = null;
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();
  jest.spyOn(db, 'delete').mockResolvedValue();

  const expectDeleted = (shouldBeDeleted: boolean) => {
    let expectation: any = expect(db.delete);

    if (!shouldBeDeleted) {
      expectation = expectation.not;
    }

    expectation.toHaveBeenCalledWith(expect.anything(), ['events.M BR0T']);
  };

  const expectCountdownToHaveBeenDeleted = () => expectDeleted(true);

  const expectCountdownNotToHaveBeenDeleted = () => expectDeleted(false);

  describe('when the CountdownEvent slot has not yet been filled', () => {
    beforeEach(() => {
      event.request.intent.slots.CountdownEvent.value = null;
    });

    it('prompts the user to fill the slot', async () => {
      const result = await executeLambda(event);

      expectCountdownNotToHaveBeenDeleted();

      expect(result).toSpeek('Okay, which event would you like to delete?');
    });
  });

  describe('when the CountdownEvent slot has a value', () => {
    describe('when the event exists', () => {
      describe('when the user has not yet confirmed the deletion', () => {
        it('confirms with the user that they really do want to delete the countdown', async () => {
          const result = await executeLambda(event);

          expectCountdownNotToHaveBeenDeleted();

          expect(result).toSpeek(
            'Are you sure you want to delete My Birthday?',
          );
        });
      });

      describe('when the user has decided not to delete the countdown afterall', () => {
        beforeEach(() => {
          event.request.intent.confirmationStatus = 'DENIED';
        });

        it('reassures the users that the countdown has not been deleted', async () => {
          const result = await executeLambda(event);

          expectCountdownNotToHaveBeenDeleted();

          expect(result).toSpeek("Okay, I didn't delete anything.");
        });
      });

      describe('when the user has confirmed the deletion', () => {
        beforeEach(() => {
          event.request.intent.confirmationStatus = 'CONFIRMED';
        });

        it('deletes the countdown and informs the user', async () => {
          const result = await executeLambda(event);

          expectCountdownToHaveBeenDeleted();

          expect(result).toSpeek('Done! My Birthday has been deleted.');
        });

        describe('when the event had associated reminders', () => {
          const reminderIds = ['a', 'b', 'c', 'd'];

          beforeEach(() => {
            userAttributes.events['M BR0T'].reminderIds = reminderIds;
          });

          describe('when the user has given reminder permissions to the skill', () => {
            it('sends a DELETE request for each reminder', async () => {
              await executeLambda(event);

              // Each DELETE request is mado to a URL that looks like:
              // https://api.amazonalexa.com/v1/alerts/reminders/<reminder ID>
              const allDeletedIds = ((getDefaultApiClient()
                .invoke as unknown) as jest.SpyInstance).mock.calls.map(
                (call) => _.last(call[0].url.split('/')),
              );

              expect(allDeletedIds).toEqual(reminderIds);
            });
          });

          describe('when the user has not given reminder permissions to the skill', () => {
            beforeEach(() => {
              event.context.System.user.permissions = null;
            });

            it('does not send any delete requests', async () => {
              await executeLambda(event);

              expect(getDefaultApiClient().invoke).not.toHaveBeenCalled();
            });
          });
        });

        describe('when the event did not have any reminders', () => {
          it('does not send any delete requests', async () => {
            await executeLambda(event);

            expect(getDefaultApiClient().invoke).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the event does not exist', () => {
      beforeEach(() => {
        userAttributes.events = {};
      });

      it("reports that the countdown doesn't exist", async () => {
        const result = await executeLambda(event);

        expectCountdownNotToHaveBeenDeleted();

        expect(result).toSpeek(
          "Shoot! I don't see a countdown for My Birthday.",
        );
      });
    });
  });
});
