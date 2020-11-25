import { LocalizationInterceptor } from '~/interceptors/LocalizationInterceptor';

beforeAll(async () => {
  await new LocalizationInterceptor().process({
    requestEnvelope: {
      request: {
        locale: 'en',
      },
    },
  } as any);
});
