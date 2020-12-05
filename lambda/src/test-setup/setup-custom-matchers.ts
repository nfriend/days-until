import diff from 'jest-diff';

expect.extend({
  toSpeek(lambdaResult: any, speech: string) {
    const options: any = {
      comment: 'SSML speech equality',
      isNot: this.isNot,
      promise: (this as any).promise,
    };

    const outputSpeechSsml = lambdaResult.response.outputSpeech?.ssml;

    let aplaSpeechSsml = lambdaResult.response.directives?.find(
      (d: any) => d.type === 'Alexa.Presentation.APLA.RenderDocument',
    )?.datasources.data.ssml;

    // The way we're testing for APLA SSML gets the "raw" value
    // of the speech without any <speak></speak> tags added.
    // To allow us to test this in the same was as outputSpeech
    // below, add the <speak> tags here.
    if (aplaSpeechSsml) {
      aplaSpeechSsml = `<speak>${aplaSpeechSsml.trim()}</speak>`;
    }

    const ssml = outputSpeechSsml || aplaSpeechSsml;

    let ssmlMatches = false;
    let ssmlWithoutTags = '';
    if (ssml) {
      ssmlMatches = ssml.trim() === `<speak>${speech}</speak>`;
      ssmlWithoutTags = ssml.trim().replace(/<\/?speak>/g, '');
    }

    const pass = ssml && ssmlMatches;

    const message = pass
      ? () =>
          this.utils.matcherHint('toSpeek', undefined, undefined, options) +
          '\n\n' +
          `Expected: ${this.utils.printExpected(speech)}\n` +
          `Received: ${this.utils.printReceived(ssmlWithoutTags)}`
      : () => {
          const diffString = diff(speech, ssmlWithoutTags, {
            expand: this.expand,
          });
          return (
            this.utils.matcherHint('toSpeek', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(speech)}\n` +
                `Received: ${this.utils.printReceived(ssmlWithoutTags)}`)
          );
        };

    return { actual: ssmlWithoutTags, message, pass };
  },
});
