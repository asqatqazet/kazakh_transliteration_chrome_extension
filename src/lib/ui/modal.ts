// Closed Shadow DOM modal — immune to host page CSS, no innerHTML, no
// XSS surface. Returns a teardown function so callers can remove it.

export type Direction = 'ltr' | 'rtl';

const HOST_TAG = 'kazakh-script-helper-modal';

const CSS = `
:host { all: initial; }
.backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2147483647;
  font: 16px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.dialog {
  background: #fff; color: #111;
  border-radius: 0.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  padding: 1.5rem 1.75rem 1.25rem;
  max-width: min(72ch, 90vw);
  max-height: 80vh;
  overflow: auto;
  position: relative;
}
.close {
  position: absolute; top: 0.4rem; right: 0.6rem;
  background: none; border: none; font-size: 1.5rem; line-height: 1;
  cursor: pointer; color: #555; padding: 0.25rem 0.5rem;
}
.close:hover { color: #000; }
.text { margin: 0; white-space: pre-wrap; word-break: break-word; }
.text[dir='rtl'] { text-align: right; }
@media (prefers-color-scheme: dark) {
  .dialog { background: #1f1f1f; color: #f0f0f0; }
  .close { color: #aaa; }
  .close:hover { color: #fff; }
}
`;

export function showModal(text: string, direction: Direction): () => void {
  // Remove any existing modal so back-to-back calls don't stack.
  document.querySelectorAll(HOST_TAG).forEach((el) => el.remove());

  const host = document.createElement(HOST_TAG);
  const root = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = CSS;
  root.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'dialog';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  const para = document.createElement('p');
  para.className = 'text';
  para.dir = direction;
  para.textContent = text;

  dialog.appendChild(closeBtn);
  dialog.appendChild(para);
  backdrop.appendChild(dialog);
  root.appendChild(backdrop);
  document.body.appendChild(host);

  const teardown = () => {
    document.removeEventListener('keydown', onKey);
    host.remove();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') teardown();
  };

  closeBtn.addEventListener('click', teardown);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) teardown();
  });
  document.addEventListener('keydown', onKey);

  return teardown;
}
