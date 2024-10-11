export const template = (importStatement: string) => `/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
${importStatement}

hydrateRoot(
  document,
  <React.StrictMode>
    <App {...(window.__INITIAL_PROPS__||{})} />
  </React.StrictMode>
);`
