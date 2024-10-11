import Elysia from "elysia";
import { ReactPlugin, type ReactPluginConfig } from "./plugin/reactPlugin";

/**
 * The ReactPlugin is a plugin for Elysia that allows you to server side render
 * React components. This plugin is designed to work with the `staticPlugin` and
 * and will generate client side js files on the fly for each React component.
 */
export const reactPlugin = (config: ReactPluginConfig) => (app: Elysia) =>
  app
    /**
     * Decorate the Elysia instance with the ReactPlugin.
     */
    .decorate("reactPlugin", new ReactPlugin(config))
    /**
     * Source import locations where server first starts.
     */
    .onStart(async ({ decorator: { reactPlugin } }) => {
      await reactPlugin.sourceFiles(Bun.main);
    })
    /**
     * Delete client side js files when the server stops.
     */
    .onStop(async ({ decorator: { reactPlugin } }) => {
      await reactPlugin.deleteClients();
    })
    /**
     * Check if the response is a React element and server side render it,
     * otherwise return the response as is.
     */
    .onAfterHandle(async ({ response, reactPlugin, ...ctx }) => {
      console.log("[reactPlugin] onAfterHandle", ctx);

      if (reactPlugin.isReact(response)) {
        return reactPlugin.serverSideRender(response);
      } else {
        return response;
      }
    });
