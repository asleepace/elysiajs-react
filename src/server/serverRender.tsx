import React from 'react'
import { renderToReadableStream } from 'react-dom/server.browser'
import { template } from '../utils/template'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'

export type SSROptions = {
  module: any | Promise<any>
  props: any
}

/**
 * Helper method for server-side rendering a react component.
 */
export async function serverRender({
  module,
  props,
}: SSROptions): Promise<Response> {
  try {
    const currentDir = dirname(fileURLToPath(import.meta.url))
    const { Component, filePath } = await importComponent(module, currentDir)
    const element = React.createElement(Component, props)

    if (!React.isValidElement(element)) {
      throw new Error('Component is not a valid React element')
    }

    const clientJSCode = await buildClientJS(filePath, currentDir)
    const initialProps = JSON.stringify(props)

    const stream = await renderToReadableStream(element, {
      bootstrapScriptContent: `window.__INITIAL_PROPS__ = ${initialProps}`,
      bootstrapScripts: clientJSCode.map((path) => `public/${path}`),
    })

    await stream.allReady

    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('[serverRender] Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Helper method for importing a component from a file path.
 */
async function importComponent(source: string, currentDir: string) {
  const projectRoot = resolve(currentDir, '../..')
  const absolutePath = join(projectRoot, source)
  const { default: Component } = await import(`file://${absolutePath}`)
  return { Component, filePath: `file://${absolutePath}` }
}

/**
 * Helper method for building the client-side JS code.
 */
async function buildClientJS(
  filePath: string,
  currentDir: string
): Promise<string[]> {
  const resolvedPath = resolve(currentDir, filePath.replace('file://', ''))
  console.log('[serverRender] resolvedPath:', resolvedPath)

  const templateString = template(`import App from '${resolvedPath}'`)
  const fileHash = Bun.hash(templateString)
  const tempName = `./client-${fileHash}.tsx`

  await Bun.write(tempName, templateString)

  const buildOutput = await Bun.build({
    entrypoints: [tempName],
    outdir: 'public',
  })

  console.log('buildOutput:', buildOutput)

  return buildOutput.outputs
    .filter((o) => o.path.endsWith('.js'))
    .map((file) => file.path.split('public/')[1])
}
