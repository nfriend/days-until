<img align="right"
src="https://raw.githubusercontent.com/nfriend/days-until/master/skill-package/assets/en-US_largeIcon.png"
width="200" />

# Days Until

<a href="https://gitlab.com/nfriend/days-until/-/pipelines/latest"
target="_blank"><img
src="https://gitlab.com/nfriend/days-until/badges/master/pipeline.svg"
alt="GitLab build status"></a>

An Alexa skill that counts the number of days until special events.

View the published skill here: https://www.amazon.com/dp/B0759KJ8D2

## Example Dialog

You: "Alexa, ask Days Until to create a new countdown for the end of the world
on May 21."<br /> **Alexa: "Okay, I'll start a new countdown for the end of the
world on May 21, 2011. Does that sound right?"**<br /> You: "Yes!"

_Later that day..._

You: "Alexa, ask Days until, 'How long until the end of the world?'"<br />
**Alexa: "17 days!"**

## Overview

Days Until helps you keep track of the number of days until special events. Set
up a count down with any of these:

- "Alexa, open Days Until"
- "Alexa, ask Days Until to start a new countdown"
- "Alexa, ask Days Until to create a countdown for the first day of school"
- "Alexa, ask Days Until to create a new countdown for the first day of school
  on August 21"

Alexa will then confirm the date with you before the count down is saved.

After you've created a count down, you can ask Alexa how many days there are
until the event:

- "Alexa, ask Days Until, 'How many days until the first day of school?'"
- "Alexa, ask Days Until, 'How long until the first day of school?'"

Alexa will then calculate the number of days from today until the event's date
and report back to you.

If you're having trouble getting Alexa to recognize your event name, try
something a bit simpler. For example, instead of "John Smith's retirement party
at the lakehouse", try "the retirement party", or even just "the party".

## Developing

1. Clone this repo
1. `cd lambda`
1. `yarn`
1. `yarn build`
1. `yarn test`
1. `yarn lint`

See the `scripts` section of [`lambda/package.json`](lambda/package.json) for a
complete list of commands that can be used during development.

Additionally, this project uses the [ASK
CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/ask-cli-intro.html) for
deployment and testing. You can install the CLI globally using `yarn global add ask-cli`, and then run CLI commands at the root of this project, e.g. `ask dialog`. See ASK CLI's documentation for a complete list of available commands.

### Building the model

This skill's model is generated using the [Alexa Skill Utterance and Schema
Generator](https://github.com/KayLerch/alexa-utterance-generator) library. This
library takes
[en-US.grammar](skill-package/interactionModels/custom/en-US.grammar) and
outputs [en-US.json](skill-package/interactionModels/custom/en-US.json). To run
this process, run `yarn model`. Note that you will need a JDK installed for this
command to run; it executes
[alexa-generate.jar](skill-package/interactionModels/custom/alexa-generate.jar)
which is included in this repository.

### Testing

The easiest way to develop on this project is using test-driven development
through [Jest](https://jestjs.io/). You can run the tests using `yarn test` or
`yarn test:watch`. See the [existing
tests](https://gitlab.com/nfriend/days-until/-/tree/master/lambda/tests) for
some examples.

### i18n

This project uses [`i18next`](https://www.i18next.com/) for internationalization
("i18n"). [`i18next-scanner`](https://github.com/i18next/i18next-scanner) is
used to extract the strings directly from the source into this project's [i18n
directory](./Lab_Assistant/lambda/custom/i18n). You can run this extraction
process by running `yarn translate`.

To make this skill available in all English-speaking Amazon stores, a utility
script
([lambda/utility-scripts/copy-english-files.js](lambda/utility-scripts/copy-english-files.js))
can be run to copy the appropriate `en-US` files/sections to `en-CA`, `en-GB`,
`en-AU`, and `en-IN`.

### Linting

This project uses [Prettier](https://prettier.io/) and
[ESLint](https://eslint.org/) to help keep the codebase consistent. You can run
all linting checks using `yarn lint`. Many of the more tedious errors can be
fixed automatically; to do this, run `yarn lint --fix`.

## Deploying

Deployment of the skill is handled by this project's [GitLab
pipeline](.gitlab-ci.yml). Any new commits added to `master` will trigger a
redeploy of the skill (to its "development" stage).

Currently, the pipeline is: <a
href="https://gitlab.com/nfriend/days-until/-/pipelines/latest"
target="_blank"><img
src="https://gitlab.com/nfriend/days-until/badges/master/pipeline.svg"
alt="GitLab build status"></a>

### Pipeline variables

The GitLab pipeline relies on a few environment variables:

| Variable name           | Description                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | The AWS access key ID of the IAM user that executes the deployment                                                                                  |
| `AWS_SECRET_ACCESS_KEY` | The AWS secret access key of the user mentioned above                                                                                               |
| `ASK_VENDOR_ID`         | The ASK vendor ID associated with the Alexa Developer account that owns the skill                                                                   |
| `ASK_REFRESH_TOKEN`     | The OAuth 2.0 refresh token of the Alexa Developer account mentioned above                                                                          |
| `SENTRY_AUTH_TOKEN`     | The Sentry API token used to upload sourcemaps to [Sentry](https://sentry.io/)                                                                      |
| `PROJECT_TOKEN`         | Token used to commit and push changes back to GitLab inside the pipeline. A project-level access token with `write_repository` scope is sufficient. |

More info on these variables and how to generate their values can be found [in
this blog
post](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2020/06/using-the-ask-cli-v2-0-to-continuously-deploy-your-skill).

## Acknowledgements

Icons from [www.flaticon.com](https://www.flaticon.com/) were made by the
following authors:

- [Freepik](https://www.flaticon.com/authors/freepik)
- [Eucalyp](https://www.flaticon.com/authors/eucalyp)
- [mangsaabguru](https://www.flaticon.com/authors/mangsaabguru)
- [Good Ware](https://www.flaticon.com/authors/good-ware)
