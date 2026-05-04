import type { Script } from './converter';

export type RuntimeMessage =
  | {
      type: 'convert-selection';
      to: Script;
      from: Script | null;
      selectionText: string;
    }
  | {
      type: 'convert-page';
      to: Script;
      from: Script | null;
    }
  | {
      // Popup-initiated: content script reads window.getSelection() itself.
      type: 'popup-convert-selection';
      to: Script;
      from: Script | null;
    };

export interface RuntimeResponse {
  ok: boolean;
  error?: string;
  stats?: { visited: number; changed: number };
}
