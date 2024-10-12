import React from 'react'
import {
  ReactDOMServerReadableStream,
  renderToReadableStream,
} from 'react-dom/server.browser'
import { template } from '../utils/template'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { unlink } from 'node:fs/promises'
import { BuildConfig } from 'bun'

export type ModuleDefault = {
  default?: React.ComponentType<any>
}

export type ModuleNamed = Record<string, React.ComponentType<any>>

export type Module = ModuleDefault | ModuleNamed

// =============== Utils ===============

const getCurrentDirectory = () => dirname(fileURLToPath(import.meta.url))

const file = (path: string) => ['file://', path].join('')

const isDefaultExport = (module: Module): module is ModuleDefault =>
  Boolean('default' in module && module.default)

const findFirstExport = (module: Module): any => {
  if (isDefaultExport(module)) return module.default
  const keys = Object.keys(module)
  for (const key of keys) {
    if (typeof module[key] === 'function') return module[key]
  }
  throw new Error('No export found')
}

// =============== SSR ===============

export type SSROptions = {
  module: any | Promise<any>
  props: any
  waitForStream?: boolean
  buildConfig?: Partial<BuildConfig>
  assetMap?: Record<string, string>
}

/**
 * Server-side rendering method for React components which calls `serverRender`
 * under the hood and returns an HTML response with the rendered content or
 * an error message if the rendering fails.
 */
export async function ssr(options: SSROptions) {
  try {
    const stream = await serverRender(options)
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(message, { status: 500 })
  }
}

/**
 * This method is used to locate the specified module, import it, and render the
 * React element to a readable stream. The client-side JS code is generated on
 * the the fly and the initial props are serialized to a JSON string.
 *
 *    1. Determine the absolute path of the module and import it.
 *    2. Generate client-side javascript code for the module.
 *    3. Render the React element to a readable stream.
 */
export async function serverRender({
  module,
  props,
  buildConfig,
  assetMap,
  waitForStream = true,
}: SSROptions): Promise<ReactDOMServerReadableStream> {
  const dir = getCurrentDirectory()
  const source = await importSource(module, dir)

  // attempt to load the default export or the first named export
  // then create a React element with the given props.
  const component = findFirstExport(source.exported)
  const element = React.createElement(component, props)

  if (!React.isValidElement(element)) {
    throw new Error('Component is not a valid React element')
  }

  // build the client-side JS code and render the element to a readable stream,
  // and serialize the initial props to a JSON string.
  const clientJSCode = await buildClientJS(source.absolutePath, buildConfig)
  const bootstrapScriptContent = makeBootstrapContent(props, assetMap)

  // render the jsx element to a readable stream and return the response, the
  // bootstrap script content is used to pass the initial props to the client,
  // and the bootstrap scripts are the client-side JS code to hydrate the app.
  const stream = await renderToReadableStream(element, {
    bootstrapScripts: clientJSCode,
    bootstrapScriptContent,
  })

  // (optional) wait for the stream to be ready before returning the response.
  if (waitForStream) await stream.allReady

  return stream
}

/**
 * Helper method for importing a component from a file path.
 */
async function importSource(source: string, currentDir: string) {
  const projectRoot = resolve(currentDir, '../..')
  const absolutePath = join(projectRoot, source)
  const relativePath = resolve(currentDir, absolutePath)
  const exported: Module = await import(file(relativePath))
  return { exported, absolutePath, relativePath }
}

/**
 * Helper method for building the client-side JS code.
 */
async function buildClientJS(
  absoluteFilePath: string,
  {
    outdir = 'public',
    naming = { asset: '[file].[ext]' },
  }: Partial<BuildConfig> = {}
): Promise<string[]> {
  const dir = getCurrentDirectory()
  const resolvedPath = resolve(dir, absoluteFilePath)
  const templateString = template(`import App from '${resolvedPath}'`)
  const fileHash = Bun.hash(templateString)
  const tempName = `./client-${fileHash}.tsx`

  await Bun.write(tempName, templateString)

  const buildOutput = await Bun.build({
    entrypoints: [tempName],
    naming,
    outdir,
  })

  await unlink(tempName) // cleanup
  console.log('[serverRender] buildOutput:', buildOutput)
  return buildOutput.outputs
    .filter((o) => o.path.endsWith('.js'))
    .map((file) => {
      // remove absolute file paths and return the public path
      const filePath = file.path.split(`${outdir}/`)[1]
      return [outdir, filePath].join('/')
    })
}

function makeBootstrapContent(
  initialProps: any,
  assetMap: Record<string, string> = {}
) {
  return `window.__INITIAL_PROPS__ = ${JSON.stringify(
    initialProps
  )}; window.__ASSET_MAP__ = ${JSON.stringify(assetMap)};`
}
