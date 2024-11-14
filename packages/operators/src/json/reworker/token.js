import { defaultDeserializeReworker, defaultSerializeReworker } from './default.js';

const serializeMapping = {
  tokenData: { name: 'tokenURI', preserve: false },
  contractData: { name: 'contractURI', preserve: false }
};
export const serializeReworker = resolve =>
  defaultSerializeReworker.concat([
    {
      type: Blob,
      transform: async (key, value) => transform(key, value, serializeMapping[String(key)], resolve)
    }
  ]);

const deserializeMapping = {
  tokenURI: { name: 'tokenData', preserve: true },
  contractURI: { name: 'contractData', preserve: true }
};
export const deserializeReworker = resolve =>
  defaultDeserializeReworker.concat([
    {
      type: URL,
      transform: async (key, value) =>
        transform(key, value, deserializeMapping[String(key)], resolve)
    }
  ]);

const transform = async (key, value, config, resolve) => {
  const result = await resolve(normalizeUrl(value), key);
  if (config?.preserve) {
    result.tokenURI = value.toString();
  }
  return [
    !config || config.preserve ? [key, value] : undefined,
    [config?.name || key, result]
  ].filter(Boolean);
};

const normalizeUrl = url => {
  const regex = /^(?<protocol>\w+:)\/\/(?<cid>\w+)\/*(?<filename>[\w.]+)*$/gm;
  const { groups } = regex.exec(url);
  return url + (groups.filename ? '' : '0');
};
