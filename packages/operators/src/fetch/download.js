import { request } from './request';
import { resolveBlob, resolveJSON, resolveText } from './resolve';

export const download = () => {
  return source => source.pipe(request());
};

export const downloadJSON = () => {
  return source => source.pipe(download(), resolveJSON());
};

export const downloadText = () => {
  return source => source.pipe(download(), resolveText());
};

export const downloadBlob = () => {
  return source => source.pipe(download(), resolveBlob());
};
