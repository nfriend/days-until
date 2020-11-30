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
    ${'2001-02-01'} | ${{ diff: -2, visual: 'My Haircut was 2 days ago', speech: 'It was 2 days ago.' }}
    ${'2001-02-02'} | ${{ diff: -1, visual: 'My Haircut was yesterday', speech: 'It was yesterday.' }}
    ${'2001-02-03'} | ${{ diff: 0, visual: 'My Haircut is today', speech: "It's today!" }}
    ${'2001-02-04'} | ${{ diff: 1, visual: 'My Haircut is tomorrow', speech: 'Only 1 day to go!' }}
    ${'2001-02-05'} | ${{ diff: 2, visual: 'My Haircut is in 2 days', speech: '2 days.' }}
  `(
    `when the event date is $eventDate, returns $output`,
    ({ eventDate, output }) => {
      const eventMoment = moment.utc(eventDate, 'YYYY-MM-DD');
      expect(getDaysUntil(eventMoment, eventName)).toEqual(output);
    },
  );
});
