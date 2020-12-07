import * as Alexa from 'ask-sdk-core';
import { adapter } from './adapters/dynamo-db';
import { getDefaultApiClient } from './api-clients/get-default-api-client';
import { buttonPressedHandler } from './handlers/button-pressed-handler';
import { connectionsResponseHandler } from './handlers/connections-response-handler';
import { createReminderIntentHandler } from './handlers/create-reminder-intent-handler';
import { errorHandler } from './handlers/error-handler';
import { intentReflectorHandler } from './handlers/intent-reflector-handler';
import { launchRequestHandler } from './handlers/launch-request-handler';
import { reportCountdownIntentHandler } from './handlers/report-countdown-intent-handler';
import { sessionEndedRequestHandler } from './handlers/session-ended-request-handler';
import { startCountdownIntentHandler } from './handlers/start-countdown-intent-handler';
import { yesIntentHandler } from './handlers/yes-intent-handler';
import { firstLaunchInterceptor } from './interceptors/first-launch-interceptor';
import { localizationInterceptor } from './interceptors/localization-interceptor';
import { sentryInterceptor } from './interceptors/sentry-interceptor';

export const handler = Alexa.SkillBuilders.custom()
  .withSkillId(process.env.SKILL_ID)
  .addRequestHandlers(
    launchRequestHandler,
    startCountdownIntentHandler,
    reportCountdownIntentHandler,
    yesIntentHandler,
    createReminderIntentHandler,
    sessionEndedRequestHandler,
    buttonPressedHandler,
    connectionsResponseHandler,

    // IntentReflectorHandler needs to be last so that it doesn't
    // override any custom intent handlers
    intentReflectorHandler,
  )
  .addRequestInterceptors(
    sentryInterceptor,
    firstLaunchInterceptor,
    localizationInterceptor,
  )
  .addErrorHandlers(errorHandler)
  .withPersistenceAdapter(adapter)
  .withApiClient(getDefaultApiClient())
  .lambda();
