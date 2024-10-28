export const replaceTypes = (key, value) => {
  if (value?.constructor && value.constructor === Date) {
    return value.toISOString();
  }

  if (value?.constructor && value.constructor === BigInt) {
    return value.toString();
  }
  return value;
};
