import { Observable, Subject } from 'rxjs';

type ResolveRoute = (reqResp: Request | Response, response?: Response) => Observable<Request>;
declare function autoPagination({ resolveRoute }: {
    resolveRoute: ResolveRoute;
}): (source: Observable<Request | Response>) => Observable<any>;

interface CacheOptions {
    ttl: number;
}
declare function cache<T>({ ttl }?: CacheOptions): (source: Observable<T>) => Observable<T>;

declare function concurrentRequest(concurrent?: number): (source: Observable<Request>) => Observable<any>;

declare function lazyPagination({ pager, concurrent, resolveRoute }: {
    pager: Observable<any>;
    concurrent: number;
    resolveRoute: (req: Request, options: any) => Request;
}): (source: Observable<Request>) => Observable<any>;

declare function polling(timeout?: number): (source: Observable<Request>) => Observable<Response>;

interface RetryWhenRequestErrorOptions {
    retryableStatuses?: number[];
    timeout?: (count: number) => number;
    count?: number;
}
declare function retryWhenRequestError({ retryableStatuses, timeout, count }?: RetryWhenRequestErrorOptions): (source: Observable<Response>) => Observable<Response>;

interface TransferStats {
    bytes: ArrayBuffer;
    total: number;
    time: number;
}
type TransferSubject = Subject<TransferStats>;

interface RequestOptions {
    retry?: RetryWhenRequestErrorOptions;
    cache?: CacheOptions;
    stats?: {
        upload?: TransferSubject[];
        download?: TransferSubject[];
    };
}
declare const request: ({ retry, cache: cacheOptions, stats }?: RequestOptions) => (source: Observable<Request | Response>) => Observable<any>;
declare const requestJSON: (options?: RequestOptions) => (source: Observable<Request | Response>) => Observable<unknown>;
declare const requestText: (options?: RequestOptions) => (source: Observable<Request | Response>) => Observable<unknown>;
declare const requestBlob: (options?: RequestOptions) => (source: Observable<Request | Response>) => Observable<unknown>;

declare function resolve<T extends Record<string, any>>(type?: string): (source: Observable<T>) => Observable<unknown>;
declare function resolveJSON<T extends Record<string, any>>(): (source: Observable<T>) => Observable<unknown>;
declare const resolveText: () => (source: Observable<Record<string, any>>) => Observable<unknown>;
declare function resolveBlob(): (source: Observable<Record<string, any>>) => Observable<unknown>;
declare const distinctUntilResponseChanged: () => (source: Observable<Response>) => Observable<Response>;

export { autoPagination, cache, concurrentRequest, distinctUntilResponseChanged, lazyPagination, polling, request, requestBlob, requestJSON, requestText, resolve, resolveBlob, resolveJSON, resolveText, retryWhenRequestError };
