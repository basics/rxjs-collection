export const reviveTypes = (key, value) => {
  if (isValidUrl(value)) {
    return new URL(value);
  }
  if (isValidISODateString(value)) {
    return new Date(value);
  }
  if (isBigInt(value)) {
    return BigInt(value);
  }
  return value;
};

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
