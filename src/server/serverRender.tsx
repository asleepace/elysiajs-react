import React from 'react'
import { renderToReadableStream } from 'react-dom/server.browser'
import { template } from '../utils/template'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { unlink } from 'node:fs/promises'
import { BuildConfig } from 'bun'

export type SSROptions = {
  module: any | Promise<any>
  props: any
  buildConfig?: Partial<BuildConfig>
}

export type ModuleDefault = {
  default?: React.ComponentType<any>
}

export type ModuleNamed = Record<string, React.ComponentType<any>>

export type Module = ModuleDefault | ModuleNamed

const getCurrentDirectory = () => {
  return dirname(fileURLToPath(import.meta.url))
}

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

/**
 * Helper method for server-side rendering a react component.
 */
export async function serverRender({
  module,
  props,
  buildConfig,
}: SSROptions): Promise<Response> {
  try {
    const dir = getCurrentDirectory()
    const source = await importSource(module, dir)
    console.log('[serverRender] source:', source)

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
    const initialProps = JSON.stringify(props)

    const toPublicPath = (path: string) => `public/${path}`
    const addContentJS = `window.__INITIAL_PROPS__ = ${initialProps}`

    const stream = await renderToReadableStream(element, {
      bootstrapScripts: clientJSCode.map(toPublicPath),
      bootstrapScriptContent: addContentJS,
    })

    await stream.allReady

    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.warn('[serverRender] Error:', error)
    return new Response((error as Error)?.message || 'Internal Server Error', {
      status: 500,
    })
  }
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
  console.log('[serverRender] resolvedPath:', resolvedPath)

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
    .map((file) => file.path.split(`${outdir}/`)[1])
}
