import { getImageForEvent, baseUrl } from '../get-image-for-event';

describe('lambda/src/util/get-image-for-event.ts', () => {
  it.each`
    eventName               | imageUrl
    ${'my haircut'}         | ${'haircut.png'}
    ${'my hair cut'}        | ${'haircut.png'}
    ${'my chair'}           | ${'calendar-check.png'}
    ${'my birthday'}        | ${'birthday-cake.png'}
    ${'my birth day party'} | ${'birthday-cake.png'}
    ${'unknown'}            | ${'calendar-check.png'}
    ${''}                   | ${'calendar-check.png'}
    ${null}                 | ${'calendar-check.png'}
    ${undefined}            | ${'calendar-check.png'}
  `(
    `when the event name is $eventName, returns ${baseUrl}$imageUrl`,
    ({ eventName, imageUrl }) => {
      expect(getImageForEvent(eventName)).toBe(baseUrl + imageUrl);
    },
  );
});
