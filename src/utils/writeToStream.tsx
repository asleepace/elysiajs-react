import React from "react";
import { renderToReadableStream } from "react-dom/server.browser";
import { unlink } from "node:fs/promises";

export type WriteToStreamConfig = {
  component: React.ReactElement;
  waitForStream?: boolean;
  clientSideJS: string;
};

export async function writeToStream({
  component,
  clientSideJS,
  waitForStream = true,
}: WriteToStreamConfig) {
  const initialProps = JSON.stringify(component["props"] || {});

  const filePath = clientSideJS.split("public/").pop();
  const publicFilePath = `public/${filePath}`;

  const stream = await renderToReadableStream(component, {
    bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${initialProps}`,
    bootstrapScripts: [publicFilePath],
  });

  if (waitForStream) {
    await stream.allReady;
  }

  return stream;
}
