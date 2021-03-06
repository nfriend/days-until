import * as Alexa from 'ask-sdk-core';
import * as fs from 'fs';
import i18n from 'i18next';
import * as path from 'path';
import * as util from 'util';

const readdirAsync = util.promisify(fs.readdir);

const I18N_DIR = path.resolve(__dirname, '../../i18n');

/** A promise that returns an object containing all available translations */
const translationsPromise = (async () => {
  const langs = (
    await readdirAsync(I18N_DIR, {
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const translations: { [lang: string]: any } = {};

  langs.forEach((l) => {
    translations[l] = {
      translation: require(path.resolve(I18N_DIR, l, 'translation.json')),
    };
  });

  return translations;
})();

export const localizationInterceptor: Alexa.RequestInterceptor = {
  async process(handlerInput: Alexa.HandlerInput) {
    const lng = handlerInput.requestEnvelope.request.locale;

    await i18n.init({
      lng,
      fallbackLng: 'en',
      resources: await translationsPromise,
      returnEmptyString: false,
      keySeparator: false,
      nsSeparator: false,
      interpolation: {
        escapeValue: false,
      },
    });
  },
};
