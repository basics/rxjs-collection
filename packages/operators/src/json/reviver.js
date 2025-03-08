import { map } from 'rxjs';

const asyncReviver = [
  { validator: () => true, handler: () => source => source.pipe(map(value => value)) }
];

export const syncReviver = [
  { validator: value => isValidUrl(value), handler: value => new URL(value) },
  { validator: value => isValidISODateString(value), handler: value => new Date(value) },
  { validator: value => isBigInt(value), handler: value => BigInt(value.slice(0, -1)) },
  { validator: value => isRegExp(value), handler: value => regExpFromString(value) },
  { validator: value => isSymbol(value), handler: value => symbolFromString(value) },
  { validator: () => true, handler: value => value }
];

export const createSyncReviver = (transforms = []) => [...transforms, ...syncReviver];
export const createAsyncReviver = (transforms = []) => [...transforms, ...asyncReviver];

const isValidUrl = value =>
  isString(value) && URL.canParse(value) && /^[\w]+:\/\/\S+$/gm.test(value);

const isValidISODateString = value => {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }
  try {
    const d = new Date(value);
    return !Number.isNaN(d.valueOf()) && d.toISOString() === value;
  } catch {
    return false;
  }
};

const isString = value => value?.constructor === String;
const isBigInt = value => isString(value) && /^\d+n$/.test(value);
const isRegExp = value => isString(value) && /^\/.*\/[gimuy]*$/.test(value);
const isSymbol = value => isString(value) && /(\w?)Symbol\((\w+)\)/g.test(value);

const regExpFromString = value => {
  const match = value.match(/^\/(.*)\/([gimuy]*)$/);
  if (!match) return null;
  const [, pattern, flags] = match;
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
};

const symbolFromString = value => {
  const { prefix, name } = /(?<prefix>\w?)Symbol\((?<name>\w+)\)/g.exec(value).groups;
  if (prefix === 'g') {
    return Symbol.for(name);
  }
  return Symbol(name);
};
