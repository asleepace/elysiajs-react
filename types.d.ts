declare module 'react-dom/server.browser' {
  export * from 'react-dom/server';
}

declare global {
  interface Window {
    __INITIAL_PROPS__: any
  }
}