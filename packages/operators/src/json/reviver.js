import { map } from 'rxjs';

const asyncReviver = [
  { validator: () => true, handler: () => source => source.pipe(map(value => value)) }
];

export const syncReviver = [
  { validator: value => isValidUrl(value), handler: value => new URL(value) },
  { validator: value => isValidISODateString(value), handler: value => new Date(value) },
  { validator: value => isBigInt(value), handler: value => BigInt(value.slice(0, -1)) },
  { validator: value => isRegExp(value), handler: value => regExpFromString(value) },
  { validator: () => true, handler: value => value }
];

export const createSyncReviver = (transforms = []) => [...transforms, ...syncReviver];
export const createAsyncReviver = (transforms = []) => [...transforms, ...asyncReviver];

const isValidUrl = value => URL.canParse(value) && /^[\w]+:\/\/\S+$/gm.test(value);

const isValidISODateString = value => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === value; // valid date
};

const isBigInt = value => value?.constructor === String && /^\d+n$/.test(value);

const isRegExp = value => value?.constructor === String && /^\/.*\/[gimuy]*$/.test(value);

const regExpFromString = q => {
  const match = q.match(/^\/(.*)\/([gimuy]*)$/);
  if (!match) return null;
  const [, pattern, flags] = match;
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
};
