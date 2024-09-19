import type { onote } from '../electron/src/preload/main/onote';

interface globalThis {
  onote: typeof onote;
}
