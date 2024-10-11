import React from "react";
import { renderToReadableStream } from "react-dom/server.browser";

export type WriteToStreamConfig = {
  component: React.ReactElement;
  waitForStreamToFinish?: boolean;
  clientSideJS: string;
};

export async function writeToStream({
  component,
  clientSideJS,
  waitForStreamToFinish = true,
}: WriteToStreamConfig) {
  const initialProps = JSON.stringify(component["props"] || {});
  console.log("initialProps", initialProps);
  const stream = await renderToReadableStream(component, {
    bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${initialProps}`,
    bootstrapScripts: [clientSideJS],
  });

  if (waitForStreamToFinish) {
    await stream.allReady;
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
