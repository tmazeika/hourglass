import { isFullscreen, openFullscreen } from './helpers';

/**
 * Lock down the client browser.
 * @throws Error if lockdown fails
 */
export default async function lock(): Promise<void> {
  // TODO take param for security settings to apply
  // - ignore-lockdown
  // - tolerate-windowed

  // browser detection
  // TODO: more robust browser detection, with version numbers:
  //   https://github.com/lancedikson/bowser
  // disallow mobile entirely!
  const isChrome = navigator.userAgent.search('Chrome') >= 0;
  const isFirefox = navigator.userAgent.search('Firefox') >= 0;
  if (!isChrome && !isFirefox) {
    throw new Error('Please use Chrome, Chromium, or Firefox to continue.');
  }

  if (!isFullscreen()) {
    try {
      await openFullscreen();
    } catch (e) {
      throw new Error('Error entering fullscreen. Please manually fullscreen the window with F11.');
    }
  }

  if (!isFullscreen()) {
    throw new Error('Try again in fullscreen.');
  }
}
