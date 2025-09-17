export { autoPagination } from './request/autoPagination';
export { cache } from './cache';
export { concurrentRequest } from './request/concurrentRequest';
export { lazyPagination } from './request/lazyPagination';
export { polling } from './request/polling';
export { request, requestJSON, requestText, requestBlob } from './request';
export {
  resolve,
  resolveJSON,
  resolveText,
  resolveBlob,
  distinctUntilResponseChanged
} from './response';
export { retryWhenRequestError } from './retry';
