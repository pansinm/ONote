import type PumlWorker from './PumlWorker';
import * as monaco from 'monaco-editor';

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000; // 2min

export class WorkerManager {
  // private _defaults: LanguageServiceDefaults;
  private _idleCheckInterval: number;
  private _lastUsedTime: number;
  // private _configChangeListener: IDisposable;

  private _worker: monaco.editor.MonacoWebWorker<PumlWorker> | null;
  private _client: Promise<PumlWorker> | null;

  constructor() {
    // this._defaults = defaults;
    this._worker = null;
    this._client = null;
    this._idleCheckInterval = window.setInterval(
      () => this._checkIfIdle(),
      30 * 1000,
    );
    this._lastUsedTime = 0;
    // this._configChangeListener = this._defaults.onDidChange(() => this._stopWorker());
  }

  private _stopWorker(): void {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  }

  dispose(): void {
    clearInterval(this._idleCheckInterval);
    // this._configChangeListener.dispose();
    this._stopWorker();
  }

  private _checkIfIdle(): void {
    if (!this._worker) {
      return;
    }
    const timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  }

  private _getClient(): Promise<PumlWorker> {
    this._lastUsedTime = Date.now();

    if (!this._client) {
      this._worker = monaco.editor.createWebWorker<PumlWorker>({
        // module that exports the create() method and returns a `CSSWorker` instance
        moduleId: 'onote/language/plantuml/pumlWorker',

        label: 'plantuml',

        // passed in to the create() method
        createData: {
          // options: this._defaults.options,
          // languageId: this._defaults.languageId,
        },
      });

      this._client = <Promise<PumlWorker>>(<any>this._worker.getProxy());
    }

    return this._client;
  }

  getLanguageServiceWorker(...resources: monaco.Uri[]): Promise<PumlWorker> {
    let _client: PumlWorker;
    return this._getClient()
      .then((client) => {
        _client = client;
      })
      .then((_) => {
        if (this._worker) {
          return this._worker.withSyncedResources(resources);
        }
      })
      .then((_) => _client);
  }
}
