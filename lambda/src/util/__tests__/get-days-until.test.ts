import { getDaysUntil } from '../get-days-until';
import moment from 'moment';
import MockDate from 'mockdate';

jest.mock('~/util/choose-one');

describe('~/util/get-days-until.ts', () => {
  const eventName = 'My Haircut';

  beforeEach(() => {
    MockDate.set(new Date(Date.UTC(2001, 1, 3)));
  });

  afterEach(() => {
    MockDate.reset();
  });

  it.each`
    eventDate       | output
    ${'2001-02-01'} | ${{ diff: -2, visual: 'My Haircut was 2 days ago', speech: 'It was 2 days ago.', predictableDescription: 'My Haircut was 2 days ago' }}
    ${'2001-02-02'} | ${{ diff: -1, visual: 'My Haircut was yesterday', speech: 'It was yesterday.', predictableDescription: 'My Haircut was yesterday' }}
    ${'2001-02-03'} | ${{ diff: 0, visual: 'My Haircut is today', speech: "It's today!", predictableDescription: 'My Haircut is today' }}
    ${'2001-02-04'} | ${{ diff: 1, visual: 'My Haircut is tomorrow', speech: 'Only 1 day to go!', predictableDescription: 'My Haircut is tomorrow' }}
    ${'2001-02-05'} | ${{ diff: 2, visual: 'My Haircut is in 2 days', speech: '2 days.', predictableDescription: 'My Haircut is in 2 days' }}
  `(
    `when the event date is $eventDate, returns $output`,
    ({ eventDate, output }) => {
      const eventMoment = moment.utc(eventDate, 'YYYY-MM-DD');
      expect(getDaysUntil(eventMoment, eventName, 'Etc/UTC')).toEqual(output);
    },
  );

  describe('when the user is not in the UTC timezone', () => {
    const expectCorrectDaysUntil = () => {
      test("returns the correct date calculation relative to the device's current timezone", () => {
        // event date must always be supplied in UTC timezone
        const eventDate = moment.utc('2001-02-05');

        expect(
          getDaysUntil(eventDate, 'Christmas', 'America/New_York').diff,
        ).toEqual(2);
      });
    };

    describe("when it's really early in the day", () => {
      beforeEach(() => {
        MockDate.set(new Date(Date.UTC(2001, 1, 3, 0, 0, 0)));
      });

      expectCorrectDaysUntil();
    });

    describe("when it's really late in the day", () => {
      beforeEach(() => {
        MockDate.set(new Date(Date.UTC(2001, 1, 3, 23, 59, 59, 999)));
      });

      expectCorrectDaysUntil();
    });
  });
});
