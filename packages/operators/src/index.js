export { autoPagination } from './request/autoPagination';
export { cache } from './request/cache';
export { concurrentRequest } from './request/concurrentRequest';
export { lazyPagination } from './request/lazyPagination';
export { polling } from './request/polling';
export { request, requestJSON, requestText, requestBlob } from './request/request';
export {
  resolve,
  resolveJSON,
  resolveText,
  resolveBlob,
  distinctUntilResponseChanged
} from './request/response';
export { retryWhenError } from './request/retry';
