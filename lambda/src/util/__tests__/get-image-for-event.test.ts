import { ASSETS_BASE_URL } from '~/constants';
import { getImageForEvent } from '../get-image-for-event';

jest.mock('~/util/choose-one');

describe('~/util/get-image-for-event.ts', () => {
  it.each`
    eventName                 | imageUrl
    ${'my birthday'}          | ${'birthday-cake.png'}
    ${'my birth day party'}   | ${'birthday-cake.png'}
    ${'christmas party'}      | ${'001-santa claus.png'}
    ${'disney trip'}          | ${'mickey-mouse.png'}
    ${'island cruise'}        | ${'cruise.png'}
    ${'last day of school'}   | ${'school.png'}
    ${'retirement party'}     | ${'sunbed.png'}
    ${'halloween'}            | ${'halloween-candy.png'}
    ${'my wedding'}           | ${'wedding-rings.png'}
    ${'my graduation'}        | ${'mortarboard.png'}
    ${'moving day'}           | ${'open-box.png'}
    ${'our anniversary'}      | ${'anniversary.png'}
    ${'easter sunday'}        | ${'easter-day.png'}
    ${"valentine's day"}      | ${'hearts.png'}
    ${'first day of summer'}  | ${'summertime.png'}
    ${'daddy comes home'}     | ${'father.png'}
    ${"mother's day"}         | ${'maternity.png'}
    ${'las vegas trip'}       | ${'las-vegas.png'}
    ${"biden's inauguration"} | ${'united-states-of-america.png'}
    ${'florida trip'}         | ${'beach.png'}
    ${"new year's eve party"} | ${'new-year.png'}
    ${'camping trip'}         | ${'camping-tent.png'}
    ${'my party'}             | ${'confetti.png'}
    ${'great wolf lodge'}     | ${'waterpark.png'}
    ${'thanksgiving'}         | ${'thanksgiving.png'}
    ${'election day'}         | ${'vote.png'}
    ${'my due date'}          | ${'baby.png'}
    ${'my concert'}           | ${'spotlight.png'}
    ${'my haircut'}           | ${'haircut.png'}
    ${'my hair cut'}          | ${'haircut.png'}
    ${'my chair'}             | ${'calendar-check.png'}
    ${'unknown'}              | ${'calendar-check.png'}
    ${''}                     | ${'calendar-check.png'}
    ${null}                   | ${'calendar-check.png'}
    ${undefined}              | ${'calendar-check.png'}
  `(
    `when the event name is $eventName, returns ${ASSETS_BASE_URL}/images/$imageUrl`,
    ({ eventName, imageUrl }) => {
      expect(getImageForEvent(eventName)).toBe(
        `${ASSETS_BASE_URL}/images/${imageUrl}`,
      );
    },
  );
});
