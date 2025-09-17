import { Subject } from 'rxjs';

export interface TransferStats {
  bytes: ArrayBuffer;
  total: number;
  time: number;
}

export type TransferSubject = Subject<TransferStats>;
