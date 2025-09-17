import { Subject } from 'rxjs';

export interface TransferStats {
  bytes: Uint8Array;
  total: number;
  time: number;
}

export type TransferSubject = Subject<TransferStats>;
