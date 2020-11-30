import { getImageForEvent, baseUrl } from '../get-image-for-event';

jest.mock('~/util/choose-one');

describe('~/util/get-image-for-event.ts', () => {
  it.each`
    eventName                 | imageUrl
    ${'my birthday'}          | ${'birthday-cake.png'}
    ${'my birth day party'}   | ${'birthday-cake.png'}
    ${'christmas party'}      | ${'001-santa claus.png'}
    ${'my wedding'}           | ${'wedding-rings.png'}
    ${"biden's inauguration"} | ${'united-states-of-america.png'}
    ${'florida trip'}         | ${'beach.png'}
    ${'my haircut'}           | ${'haircut.png'}
    ${'my hair cut'}          | ${'haircut.png'}
    ${'my chair'}             | ${'calendar-check.png'}
    ${'unknown'}              | ${'calendar-check.png'}
    ${''}                     | ${'calendar-check.png'}
    ${null}                   | ${'calendar-check.png'}
    ${undefined}              | ${'calendar-check.png'}
  `(
    `when the event name is $eventName, returns ${baseUrl}$imageUrl`,
    ({ eventName, imageUrl }) => {
      expect(getImageForEvent(eventName)).toBe(baseUrl + imageUrl);
    },
  );
});
