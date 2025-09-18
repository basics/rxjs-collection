import type { Observable } from 'rxjs';

import { minimatch } from 'minimatch';
import { concatMap, from, map, of } from 'rxjs';

export function blobToJSON() {
  return (source: Observable<Blob>) =>
    source.pipe(
      blobToText(),
      map(text => JSON.parse(text))
    );
}

export function blobToText() {
  return (source: Observable<Blob>) => source.pipe(concatMap(blob => from(blob.text())));
}

export function blobToXML() {
  return (source: Observable<Blob>) =>
    source.pipe(
      concatMap(blob =>
        of(blob).pipe(
          blobToText(),
          map(xmlString =>
            new DOMParser().parseFromString(xmlString, blob.type as DOMParserSupportedType)
          )
        )
      )
    );
}

export function blobToURL() {
  return (source: Observable<Blob>) => source.pipe(map(blob => URL.createObjectURL(blob)));
}

export function blobTo() {
  return (source: Observable<Blob>) =>
    source.pipe(concatMap(blob => of(blob).pipe(getOperator(blob)())));
}

function getOperator(blob: Blob) {
  return (Object.entries(TYPES)
    .sort(([a], [b]) => b.length - a.length)
    .find(([type]) => minimatch(blob.type, type)) || ['', () => source => source])[1];
}

const TYPES = Object.freeze({
  'video/*': blobToURL,
  'application/json': blobToJSON,
  'text/plain': blobToText,
  'text/html': blobToXML,
  'text/xml': blobToXML,
  'application/xml': blobToXML,
  'application/xhtml+xml': blobToXML,
  'image/svg+xml': blobToXML
});
