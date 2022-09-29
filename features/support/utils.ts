import type { ElectronApplication, Page } from 'playwright';

export function getElectronApp() {
  return (global as any).electronApp as ElectronApplication;
}

export const delay = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));
