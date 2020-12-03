import { localizationInterceptor } from '~/interceptors/localization-interceptor';

beforeAll(async () => {
  await localizationInterceptor.process({
    requestEnvelope: {
      request: {
        locale: 'en',
      },
    },
  } as any);
});
