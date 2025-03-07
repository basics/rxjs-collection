import { map } from 'rxjs';

const asyncReviver = [
  { validator: () => true, handler: () => source => source.pipe(map(value => value)) }
];

export const syncReviver = [
  { validator: value => isValidUrl(value), handler: value => new URL(value) },
  { validator: value => isValidISODateString(value), handler: value => new Date(value) },
  { validator: value => isBigInt(value), handler: value => BigInt(value) },
  { validator: () => true, handler: value => value }
];

export const createSyncReviver = (transforms = []) => [...transforms, ...syncReviver];
export const createAsyncReviver = (transforms = []) => [...transforms, ...asyncReviver];

const isValidUrl = value => {
  return URL.canParse(value) && /^[\w]+:\/\/\S+$/gm.test(value);
};

function isValidISODateString(value) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) return false;
  const d = new Date(value);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === value; // valid date
}

function isBigInt(value) {
  return value?.constructor === String && /^\d+$/.test(value);
}
