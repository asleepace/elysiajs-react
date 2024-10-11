import React from 'react'
import {
  ReactDOMServerReadableStream,
  renderToReadableStream,
} from 'react-dom/server.browser'
import { ReactBundledCode } from './createClientSideJS'
import { enumerateReactChildren } from './HTMLHoisting'

export type ReactStreamConfig = {
  clientBundle: ReactBundledCode
  component: React.ReactElement
  waitForStream?: boolean
  publicPath?: string
  verbose?: boolean
}

/**
 * Writes a React element to a readable stream which can be sent to the client
 * as the body of a response. Takes a client side js file path to include in the
 * response for hydrating the client, and an optional flag to wait for the stream
 * to completely render before returning.
 */
export async function writeToStream({
  component,
  clientBundle,
  verbose,
  waitForStream = true,
}: ReactStreamConfig): Promise<ReactDOMServerReadableStream> {
  const initialProps = JSON.stringify(component['props'] || {})
  const { clientSideJS } = clientBundle

  enumerateReactChildren(component)

  console.log('[reactPlugin] component', component)

  const filePath = clientSideJS.split('public/').pop()
  const publicFilePath = `public/${filePath}`

  if (verbose) {
    console.log('[reactPlugin] public path:', publicFilePath)
    console.log('[reactPlugin] client side js:', clientSideJS)
    console.log('[reactPlugin] initial props:', initialProps)
  }

  const stream = await renderToReadableStream(component, {
    bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${initialProps};`,
    bootstrapScripts: [publicFilePath],
  })

  // wait for the stream to completely render
  if (waitForStream) await stream.allReady

  return stream
}
