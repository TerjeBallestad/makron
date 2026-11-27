import { createToastManager } from '@terjeballestad/bob';

/** Makron's one toast manager (Bob 1.0, DD-036). main.tsx hands it to ToastStack. */
export const toastManager = createToastManager();

/** The `ui.toast(msg)` every view calls. A toast closes after ToastStack's timeout (2.4 s). */
export const toast = (msg: string) => {
  toastManager.add({ title: msg });
};
