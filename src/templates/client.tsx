/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from 'react'
import { hydrateRoot } from 'react-dom/client'
// @template-placeholder

declare global {
  const App: React.FC<any>
}

hydrateRoot(document, <App />)