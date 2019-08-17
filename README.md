<p align="center">
  <img src="./icon.png" height="256" /><br />
  <h1 align="center">Days Until</h1>
</p>

An Alexa skill that counts the number of days until special events.

View the published skill here: https://www.amazon.com/dp/B0759KJ8D2

## Example Dialog

You: "Alexa, ask Days Until to create a new countdown for the end of the world on May 21."<br />
**Alexa: "Okay, I'll start a new countdown for the end of the world on May 21, 2011. Does that sound right?"**<br />
You: "Yes!"

_Later that day..._

You: "Alexa, ask Days until, 'How long until the end of the world?'"<br />
**Alexa: "17 days!"**

## Overview

Days Until helps you keep track of the number of days until special events. Set up a count down with any of these:

- "Alexa, open Days Until"
- "Alexa, ask Days Until to start a new countdown"
- "Alexa, ask Days Until to create a countdown for the first day of school"
- "Alexa, ask Days Until to create a new countdown for the first day of school on August 21"

Alexa will then confirm the date with you before the count down is saved.

After you've created a count down, you can ask Alexa how many days there are until the event:

- "Alexa, ask Days Until, 'How many days until the first day of school?'"
- "Alexa, ask Days Until, 'How long until the first day of school?'"

Alexa will then calculate the number of days from today until the event's date and report back to you.

If you're having trouble getting Alexa to recognize your event name, try something a bit simpler. For example, instead of "John Smith's retirement party at the lakehouse", try "the retirement party", or even just "the party".

## Developing

1. Clone this repo
1. `cd lambda`
1. `npm install`
1. Create a file inside the `lambda` directory named `appId.json` containing the Skill's ID, surrounded in double quotes
1. Ensure you have both `7zip` and the AWS CLI tool installed (and configured)
   - See the comments in the `deploy-*` scripts for more information
1. On \*nix, make `deploy-nix.sh` executable: `chmod u+x deploy-nix.sh`
1. Run the `deploy-*` script. This script runs the TypeScript build, compresses the contents using `7zip`, and uploads the result to Lambda

## Acknowledgements

Icons made by [Freepik](http://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/).
