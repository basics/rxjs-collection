import { minimatch } from 'minimatch';
import { concatMap, from, map, of } from 'rxjs';

export const blobToJSON = () => {
  return source =>
    source.pipe(
      blobToText(),
      map(text => JSON.parse(text))
    );
};

export const blobToText = () => {
  return source => source.pipe(concatMap(blob => from(blob.text())));
};

export const blobToXML = () => {
  return source =>
    source.pipe(
      concatMap(blob =>
        of(blob).pipe(
          blobToText(),
          map(xmlString => new DOMParser().parseFromString(xmlString, blob.type))
        )
      )
    );
};

export const blobToURL = () => {
  return source => source.pipe(map(blob => URL.createObjectURL(blob)));
};

export const blobTo = () => {
  return source => source.pipe(concatMap(blob => of(blob).pipe(getOperator(blob)())));
};

const getOperator = blob => {
  return (Object.entries(TYPES)
    .sort(([a], [b]) => b.length - a.length)
    .find(([type]) => minimatch(blob.type, type)) || ['', () => source => source])[1];
};

const TYPES = {
  'video/*': blobToURL,
  'application/json': blobToJSON,
  'text/plain': blobToText,
  'text/html': blobToXML,
  'text/xml': blobToXML,
  'application/xml': blobToXML,
  'application/xhtml+xml': blobToXML,
  'image/svg+xml': blobToXML
};
