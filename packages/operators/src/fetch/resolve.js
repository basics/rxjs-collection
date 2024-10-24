import { concatMap } from 'rxjs';

export const resolve = (type = 'json') => {
  return source => source.pipe(concatMap(e => e[String(type)]()));
};

export const resolveJSON = () => {
  return resolve('json');
};

export const resolveText = () => {
  return resolve('text');
};

export const resolveBlob = () => {
  return resolve('blob');
};
