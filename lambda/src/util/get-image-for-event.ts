export const baseUrl = 'https://d1qqbfelg1beem.cloudfront.net/images/';

/**
 * Tries to pick an image that matches an event.
 * If nothing matches, returns a generic calendar image.
 *
 * @param eventName The name of the event
 * @returns The URL of an image that matches the event
 */
export const getImageForEvent = (eventName: string): string => {
  const imageLookup = [
    {
      substrings: ['hair', 'haircut'],
      image: 'haircut.png',
    },
    {
      substrings: ['birthday', 'birth day'],
      image: 'birthday-cake.png',
    },
    {
      substrings: [
        'wedding',
        'marriage',
        'married',
        'marry',
        'marries',
        'matrimony',
        'nuptials',
        'wedlock',
      ],
      image: 'wedding-rings.png',
    },
  ];

  const defaultImage = 'calendar-check.png';

  const image =
    imageLookup.find((option) => {
      return option.substrings.some((str) => {
        return new RegExp(`\\b${str}\\b`, 'gi').test(eventName);
      });
    })?.image || defaultImage;

  return baseUrl + image;
};
