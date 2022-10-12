import { deburr, kebabCase, lowerCase } from 'lodash-es';

export default (text: string) => {
  return kebabCase(lowerCase(deburr(text)));
};
