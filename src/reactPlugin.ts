import Elysia from "elysia";
import { findComponentSource } from "./utils/findComponentSource";
import { findImports } from "./utils/findImports";
import { isReactComponent } from "./utils/isReactComponent";
import { unlink } from "node:fs/promises";
import { createClientSideJS } from "./utils/createClientSideJS";
import { writeToStream } from "./utils/writeToStream";

export type ReactPluginConfig = {
  tempDir?: string;
  waitForStreamToFinish?: boolean;
  publicPath?: string;
};

export const reactPlugin =
  ({
    tempDir = "./src",
    publicPath = "public",
    waitForStreamToFinish = true,
  }: ReactPluginConfig) =>
  (app: Elysia) =>
    app
      .decorate("reactPlugin", {
        sources: new Array<string>(),
        clients: new Array<string>(),
        temp: new Array<string>(),
      })
      .onError((err) => {
        console.warn("[reactPlugin] error", err);
      })
      .onStart(async ({ decorator: { reactPlugin } }) => {
        const sources = await findImports(Bun.main);
        reactPlugin.sources.push(...sources);
      })
      .onStart(async (ctx) => {
        // delete the client side js file
      })
      .onStop(async ({ decorator: { reactPlugin } }) => {
        await Promise.all(reactPlugin.temp.map(unlink))
          .then(() => console.log("[reactPlugin] temp files deleted"))
          .catch(console.warn);
      })

      .onAfterHandle(async ({ response: component, reactPlugin, set }) => {
        // check if the response is a react component
        if (!isReactComponent(component)) return component;

        // extract the react plugin data
        const { clients, sources } = reactPlugin;

        // extract the component name and import statement
        const importStatement = await findComponentSource({
          component,
          sources,
        });

        // create the client side js file
        const clientSideJS = await createClientSideJS({
          importStatement,
          publicPath,
          clients,
          tempDir,
        });

        // write the component to a stream
        const output = await writeToStream({
          component,
          clientSideJS,
          waitForStreamToFinish,
        });

        return new Response(output, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      });
