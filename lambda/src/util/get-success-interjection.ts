// See https://developer.amazon.com/docs/custom-skills/speechcon-reference-interjections-english-us.html

import { chooseOne } from './choose-one';
import { getAllSuccessInterjections } from './get-all-success-interjections';

export const getSuccessInterjection = () => {
  return chooseOne(...getAllSuccessInterjections());
};
