import { Messages } from './../types';

export default (o: Messages): Messages => {
  return Object.keys(o)
    .sort()
    .reduce((all: {[key: string]: any}, key: string) => {
      all[key] = o[key];

      return all;
    }, {});
}