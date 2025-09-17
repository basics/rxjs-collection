import { fetch, setGlobalDispatcher, Agent } from 'undici';

export function fixTLS() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  (global.fetch as unknown) = fetch;
  setGlobalDispatcher(
    new Agent({
      connect: { rejectUnauthorized: false }
    })
  );
}
