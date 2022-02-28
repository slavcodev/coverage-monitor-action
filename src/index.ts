import * as core from '@actions/core';
import * as github from '@actions/github';
import App from './types/App';

(async function (): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const app = new App(core, github);
    await app.run();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
})();
