export const createResponse = (url, content, options = { status: 200 }) => {
  const resp = new Response(content, options);
  Object.defineProperty(resp, 'url', { value: url });
  return resp;
};
