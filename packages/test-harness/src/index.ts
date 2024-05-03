import { TestType, runAllTests } from "./runAllTests";

import type { NeovimClient, NvimPlugin } from "neovim";

/**
 * Runs all extension tests.  This function should only be called after attaching to the
 * "node" process, such as when testing cursorless in neovim.
 * We use this runner for both the local test launch config
 * and the CI test runner action.
 * @returns A promise that resolves when tests have finished running
 */
// FIXME: this is neovim specific atm so in the future we can support other apps here
// with an environment variable
export function run(plugin: NvimPlugin): Promise<void> {
  // https://github.com/mochajs/mocha/issues/3780#issuecomment-583064196
  // https://stackoverflow.com/questions/69427050/how-to-extend-globalthis-global-type
  (global as any).additionalParameters = {
    client: plugin.nvim as NeovimClient,
  };
  return runAllTests(TestType.neovim, TestType.unit);
}

/**
 * Extension entrypoint called by node-client on Neovim startup.
 * - Register the functions that are exposed to Neovim.
 *   Note that these function need to start with a capital letter to be callable from Neovim.
 */
export default function entry(plugin: NvimPlugin) {
  plugin.registerFunction("TestHarnessRun", async () => await run(plugin), {
    sync: false,
  });
}
