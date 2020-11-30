import { chooseOne } from './choose-one';

const imageLookup = [
  {
    substrings: ['birthday', 'birth day'],
    image: chooseOne(
      'birthday-cake.png',
      'balloons.png',
      'confetti.png',
      'birthday-cake-2.png',
      'birthday-cake-3.png',
      'birthday-banner.png',
    ),
  },
  {
    substrings: [
      'christmas',
      'santa',
      'boxing day',
      'the holiday',
      'the holidays',
      'baby jesus',
    ],
    image: chooseOne(
      '001-santa claus.png',
      '002-star.png',
      '003-christmas tree.png',
      '004-flag.png',
      '005-christmas wreath.png',
      '006-deer.png',
      '007-party popper.png',
      '008-gift.png',
      '009-mistletoe.png',
      '010-christmas carols.png',
      '011-candy cane.png',
      '012-christmas sock.png',
      '013-gnome.png',
      '014-christmas wreath.png',
      '015-bauble.png',
      '016-candle.png',
      '017-bauble.png',
      '018-snow globe.png',
      '019-gingerbread man.png',
      '020-bauble.png',
      '021-light.png',
      '022-christmas bell.png',
      '023-fireplace.png',
      '024-elf.png',
      '025-headband.png',
      '026-elf.png',
      '027-firework.png',
      '028-tag.png',
      '029-snow globe.png',
      '030-angel.png',
      '031-bauble.png',
      '032-christmas tree.png',
      '033-gift.png',
      '034-candle.png',
      '035-gift.png',
      '036-door.png',
      '037-star.png',
      '038-snowman.png',
      '039-jingle bell.png',
      '040-poinsettia.png',
      '041-toy.png',
      '042-train.png',
      '043-lantern.png',
      '044-christmas card.png',
      '045-garland.png',
      '046-christmas hat.png',
      '047-sleigh.png',
      '048-handbell.png',
      '049-snowflake.png',
      '050-gift.png',
    ),
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
  {
    substrings: [
      'vacation',
      'trip',
      'holiday',
      'florida',
      'beach',
      'cancun',
      'hawaii',
      'jamaica',
      'bahamas',
    ],
    image: chooseOne(
      'beach.png',
      'beach-2.png',
      'sunbed.png',
      'summertime.png',
      'suitcases.png',
    ),
  },
  {
    substrings: [
      'july 4',
      'july four',
      'july fourth',
      'fourth of july',
      '4th of july',
      'indepedence day',
      'america',
      'american',
      'unites states',
      'usa',
      'inauguration',
      'trump',
      'biden',
      'obama',
    ],
    image: 'united-states-of-america.png',
  },
  {
    substrings: ['hair', 'haircut'],
    image: 'haircut.png',
  },
];

const defaultImage = 'calendar-check.png';

export const baseUrl = 'https://d1qqbfelg1beem.cloudfront.net/images/';

/**
 * Tries to pick an image that matches an event.
 * If nothing matches, returns a generic calendar image.
 *
 * @param eventName The name of the event
 * @returns The URL of an image that matches the event
 */
export const getImageForEvent = (eventName: string): string => {
  const image =
    imageLookup.find((option) => {
      return option.substrings.some((str) => {
        return new RegExp(`\\b${str}\\b`, 'gi').test(eventName);
      });
    })?.image || defaultImage;

  return baseUrl + image;
};
