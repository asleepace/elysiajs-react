declare module 'react-dom/server.browser' {
  export * from 'react-dom/server'
}

declare interface globalThis {
  __INITIAL_PROPS__: any
}

declare interface Window {
  /**
   * Initial props for the application to hydrate the client react application.
   *
   * @package elysiajs-react
   */
  __INITIAL_PROPS__: any
}
å

declare module './server-components' {
  export module 'index.js' {
    export default ServerComponent
  }
}
