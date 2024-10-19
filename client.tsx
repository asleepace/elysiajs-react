/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from '/Users/asleepace/dev/elysiajs-react/src/react/HomePage'

hydrateRoot(
  document.getElementById('root') || document,
  <React.StrictMode>
    <App {...(window.__INITIAL_PROPS__||{})} />
  </React.StrictMode>
);