import { concatMap, map } from 'rxjs';

import { replaceTypes } from './json/replacer.js';
import { reviveTypes } from './json/reviver.js';
import { defaultDeserializeReworker, defaultSerializeReworker } from './json/reworker/default.js';
import { signJSON, verifyJSON } from './sign.js';

export const serialize = (reworker, signer) => source =>
  source.pipe(
    rework(reworker || defaultSerializeReworker),
    map(data => JSON.stringify(data, replaceTypes)),
    signJSON(signer)
  );

export const deserialize = (reworker, signAddress) => source =>
  source.pipe(
    verifyJSON(signAddress),
    map(data => JSON.parse(data, reviveTypes)),
    rework(reworker || defaultDeserializeReworker)
  );

const rework = reworker => source =>
  source.pipe(
    concatMap(data => reworkEntry('data', data, reworker)),
    map(data => Object.fromEntries(data).data)
  );

const reworkEntry = async (key, value, reworker) => {
  const { transform } = reworker.find(({ type }) => type === value?.constructor) || {};
  if (transform) {
    return await transform(key, value, reworkEntry, reworker);
  } else {
    return [[key, value]];
  }
};
