/**
 * Basic client side hydration template which will be generated on the fly
 * for each React component. This works by interpolating the import statement
 * and the initial props into the template string, which is then written to a
 * temp file and transpiled by `Bun.build` to your `publicPath` as a client
 * side js file which will be loaded by the client.
 *
 * NOTE: It is important that the import statement both contains the right component
 * name and path to the component file, otherwise the client side js file will not
 * be generated correctly.
 *
 * @param {string} importStatement - The import statement of the React component.
 * @param {object} initialProps - The initial props to hydrate the component with.
 * @returns {string} - The client side hydration template.
 */
export const template = (
  importStatement: string,
  initialProps: any = {}
) => `/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
${importStatement}

hydrateRoot(
  document.getElementById('root') || document,
  <React.StrictMode>
    <App {...(window.__INITIAL_PROPS__||{})} />
  </React.StrictMode>
);`
