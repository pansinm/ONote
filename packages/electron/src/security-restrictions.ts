import { app, shell } from 'electron';
import { URL } from 'url';
import { sendToMain } from './window/ipc';
import { getLogger } from '/@/shared/logger';

const logger = getLogger('SecurityRestrictions');

/**
 * List of origins that you allow open INSIDE the application and permissions for each of them.
 *
 * In development mode you need allow open `VITE_DEV_SERVER_URL`
 */
const ALLOWED_ORIGINS_AND_PERMISSIONS = new Map<
  string,
  Set<
    | 'clipboard-read'
    | 'clipboard-write'
    | 'clipboard-sanitized-write'
    | 'media'
    | 'display-capture'
    | 'mediaKeySystem'
    | 'geolocation'
    | 'notifications'
    | 'midi'
    | 'midiSysex'
    | 'pointerLock'
    | 'fullscreen'
    | 'openExternal'
    | 'unknown'
  >
>(
  process.env.NODE_ENV === 'development'
    ? [
        [
          'http://localhost:8080',
          new Set([
            'clipboard-read',
            'clipboard-write',
            'clipboard-sanitized-write',
            'notifications',
            'openExternal',
          ]),
        ],
      ]
    : [
        [
          'null',
          new Set([
            'clipboard-read',
            'clipboard-write',
            'clipboard-sanitized-write',
            'notifications',
            'openExternal',
          ]),
        ],
      ],
);

/**
 * List of origins that you allow open IN BROWSER.
 * Navigation to origins below is possible only if the link opens in a new window
 *
 * @example
 * <a
 *   target="_blank"
 *   href="https://github.com/"
 * >
 */
const ALLOWED_EXTERNAL_ORIGINS = new Set<`https://${string}`>([
  'https://github.com',
  'https://api.github.com',
]);

app.on('web-contents-created', (_, contents) => {
  /**
   * Block navigation to origins not on the allowlist.
   *
   * Navigation is a common attack vector. If an attacker can convince the app to navigate away
   * from its current page, they can possibly force the app to open web sites on the Internet.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
   */
  contents.on('will-navigate', (event, url) => {
    logger.debug('Will navigate', { url });
    const { protocol, origin } = new URL(url);
    if (protocol === 'file:') {
      return;
    }
    if (ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin)) {
      return;
    }

    // Prevent navigation
    event.preventDefault();

    if (process.env.NODE_ENV === 'development') {
      logger.warn('Blocked navigating to unallowed origin', { origin });
    }
  });

  /**
   * Block requested unallowed permissions.
   * By default, Electron will automatically approve all permission requests.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
   */
  contents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const { origin } = new URL(webContents.getURL());
      const permissionGranted =
        !!ALLOWED_ORIGINS_AND_PERMISSIONS.get(origin)?.has(permission);

      callback(permissionGranted);

      if (!permissionGranted && process.env.NODE_ENV === 'development') {
        logger.warn('Blocked permission request', { origin, permission });
      }
    },
  );

  /**
   * Hyperlinks to allowed sites open in the default browser.
   *
   * The creation of new `webContents` is a common attack vector. Attackers attempt to convince the app to create new windows,
   * frames, or other renderer processes with more privileges than they had before; or with pages opened that they couldn't open before.
   * You should deny any unexpected window creation.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
   * @see https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-openexternal-with-untrusted-content
   */
  contents.setWindowOpenHandler(({ url }) => {
    const { origin } = new URL(url);

    // @ts-expect-error Type checking is performed in runtime
    if (ALLOWED_EXTERNAL_ORIGINS.has(origin)) {
      // Open default browser
      shell.openExternal(url).catch((err) => {
        logger.error('Failed to open external URL', err, { url });
      });
    } else if (process.env.NODE_ENV === 'development') {
      logger.warn('Blocked opening external URL', { origin });
    }

    // Prevent creating new window in application
    return { action: 'deny' };
  });

  /**
   * Verify webview options before creation
   *
   * Strip away preload scripts, disable Node.js integration, and ensure origins are on the allowlist.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
   */
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    const { origin } = new URL(params.src);
    if (!ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin)) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Blocked webview attachment', { src: params.src });
      }

      event.preventDefault();
      return;
    }

    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    // @ts-expect-error `preloadURL` exists - see https://www.electronjs.org/docs/latest/api/web-contents#event-will-attach-webview
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });
});
